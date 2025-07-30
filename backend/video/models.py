from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
# models.py



def video_upload_path(instance, filename):
    import uuid
    return f"videos/{uuid.uuid4()}_{filename}"


 

class VideoPresentation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('validated', 'Validée'),
        ('final', 'Finale'),
    ]
    
    AI_FEEDBACK_STATUS_CHOICES = [
        ('not_requested', 'Non demandée'),
        ('requested', 'Demandée'),
        ('processing', 'En cours'),
        ('completed', 'Terminée'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="video_presentations"
    )
    title = models.CharField(max_length=255, blank=True, null=True)
    video = models.FileField(upload_to=video_upload_path)
    created_at = models.DateTimeField(auto_now_add=True)
    uploaded_at = models.DateTimeField(blank=True, null=True)
    
    # Status fields (matching frontend expectations)
    validated = models.BooleanField(default=False)         # Candidate clicked validate
    final_validated = models.BooleanField(default=False)   # Candidate made it "official"
    
    # AI Feedback fields
    ai_feedback_requested = models.BooleanField(default=False)
    ai_feedback_received = models.BooleanField(default=False)
    ai_feedback_status = models.CharField(
        max_length=20, 
        choices=AI_FEEDBACK_STATUS_CHOICES, 
        default='not_requested'
    )
    ai_feedback_data = models.JSONField(blank=True, null=True)  # Store AI analysis results
    
    # Video metadata
    duration = models.DurationField(blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True)  # File size in bytes
    resolution = models.CharField(max_length=20, blank=True, null=True)  # e.g., "1280x720"
    
    # Optional fields
    comment = models.TextField(blank=True, null=True)      # Optional: admin/review note
    industry = models.CharField(max_length=100, blank=True, null=True)  # User's industry

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Video {self.id} by {getattr(self.user, 'username', self.user_id)}"
    
    @property
    def is_final(self):
        """Property to match frontend 'isFinal' expectation"""
        return self.final_validated
    
    @property
    def is_validated(self):
        """Property to match frontend 'isValidated' expectation"""
        return self.validated
    
    @property
    def ai_feedback_requested_prop(self):
        """Property to match frontend 'aiFeedbackRequested' expectation"""
        return self.ai_feedback_requested
    
    @property
    def ai_feedback_received_prop(self):
        """Property to match frontend 'aiFeedbackReceived' expectation"""
        return self.ai_feedback_received
    
    def save(self, *args, **kwargs):
        # Auto-update AI feedback status based on boolean fields
        if self.ai_feedback_requested and not self.ai_feedback_received:
            self.ai_feedback_status = 'requested'
        elif self.ai_feedback_requested and self.ai_feedback_received:
            self.ai_feedback_status = 'completed'
        elif not self.ai_feedback_requested:
            self.ai_feedback_status = 'not_requested'
        
        super().save(*args, **kwargs)
    
