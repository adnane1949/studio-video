from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from .models import VideoPresentation
from .serializers import VideoPresentationSerializer

# Create your views here.

class VideoPresentationViewSet(ModelViewSet):
    serializer_class = VideoPresentationSerializer
    permission_classes = []

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return VideoPresentation.objects.filter(user_id=user_id)
        return VideoPresentation.objects.all()

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        final_validated = self.request.data.get('final_validated', None)
        if final_validated is True or final_validated == 'true':
            # Unmark all other videos as final
            VideoPresentation.objects.all().update(final_validated=False)
        serializer.save()

    @action(detail=True, methods=['post'])
    def request_ai_feedback(self, request, pk=None):
        """Request AI feedback for a video"""
        try:
            video = self.get_object()
            video.ai_feedback_requested = True
            video.ai_feedback_status = 'requested'
            video.save()
            
            # Here you would typically trigger your AI analysis
            # For now, we'll just mark it as requested
            
            return Response({
                'message': 'AI feedback request submitted successfully',
                'video_id': video.id,
                'ai_feedback_requested': True
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Failed to request AI feedback',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_final(self, request, pk=None):
        """Mark a video as final (only one video can be final per user)"""
        try:
            video = self.get_object()
            
            # Unmark all other videos as final
            VideoPresentation.objects.all().update(final_validated=False)
            
            # Mark this video as final
            video.final_validated = True
            video.save()
            
            return Response({
                'message': 'Video marked as final successfully',
                'video_id': video.id,
                'final_validated': True
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Failed to mark video as final',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def validate_video(self, request, pk=None):
        """Mark a video as validated"""
        try:
            video = self.get_object()
            video.validated = True
            video.save()
            
            return Response({
                'message': 'Video validated successfully',
                'video_id': video.id,
                'validated': True
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Failed to validate video',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# Legacy views for backward compatibility
class VideoPresentationListCreateView(generics.ListCreateAPIView):
    serializer_class = VideoPresentationSerializer
    permission_classes = []

    def get_queryset(self):
        return VideoPresentation.objects.all()

    def perform_create(self, serializer):
        serializer.save()

class VideoPresentationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VideoPresentationSerializer
    permission_classes = []

    def get_queryset(self):
        return VideoPresentation.objects.all()

    def perform_update(self, serializer):
        final_validated = self.request.data.get('final_validated', None)
        if final_validated is True or final_validated == 'true':
            VideoPresentation.objects.all().update(final_validated=False)
        serializer.save()
