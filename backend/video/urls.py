# video/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VideoPresentationViewSet, VideoPresentationListCreateView, VideoPresentationDetailView

# Create a router for the ViewSet
router = DefaultRouter()
router.register(r'videos', VideoPresentationViewSet, basename='video')

urlpatterns = [
    # ViewSet URLs (recommended)
    path('', include(router.urls)),
    
    # Legacy URLs for backward compatibility
    path('presentations/', VideoPresentationListCreateView.as_view(), name='video-list-create'),
    path('presentations/<int:pk>/', VideoPresentationDetailView.as_view(), name='video-detail'),
]