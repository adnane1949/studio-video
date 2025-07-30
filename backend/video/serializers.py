from rest_framework import serializers
from .models import VideoPresentation
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'industry')

class VideoPresentationSerializer(serializers.ModelSerializer):
    # Properties to match frontend expectations
    isFinal = serializers.BooleanField(source='is_final', read_only=True)
    isValidated = serializers.BooleanField(source='is_validated', read_only=True)
    aiFeedbackRequested = serializers.BooleanField(source='ai_feedback_requested_prop', read_only=True)
    aiFeedbackReceived = serializers.BooleanField(source='ai_feedback_received_prop', read_only=True)
    
    # Format duration for frontend
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoPresentation
        fields = [
            'id', 'user', 'title', 'video', 'created_at', 'uploaded_at',
            'validated', 'final_validated', 'duration', 'comment',
            'ai_feedback_requested', 'ai_feedback_received', 'ai_feedback_status',
            'ai_feedback_data', 'file_size', 'resolution', 'industry',
            # Frontend-compatible properties
            'isFinal', 'isValidated', 'aiFeedbackRequested', 'aiFeedbackReceived'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'uploaded_at', 'file_size']

    def get_duration(self, obj):
        """Format duration as MM:SS for frontend"""
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            minutes = total_seconds // 60
            seconds = total_seconds % 60
            return f"{minutes:02d}:{seconds:02d}"
        return None

    def create(self, validated_data):
        return VideoPresentation.objects.create(**validated_data)
    


    