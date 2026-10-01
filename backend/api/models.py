from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    firstname = models.TextField(null=True, blank=True)
    lastname = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.user.username


class OrganizerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="organizers")
    company = models.CharField(max_length=200)
    profile_photo = models.ImageField(upload_to="organizers/profiles/", null=True, blank=True)
    bio = models.TextField(blank=True)
    address = models.CharField(max_length=300, blank=True)
    location = models.TextField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    email = models.CharField(max_length=80, blank=True)
    services = models.JSONField(
        default=list,
        blank=True
    )
    price_range = models.CharField(max_length=100, blank=True)
    packages = models.JSONField(
        default=list,
        blank=True
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=0.0
    )

    def __str__(self):
        return self.company


class PortfolioImage(models.Model):
    organizer = models.ForeignKey(OrganizerProfile, on_delete=models.CASCADE, related_name="portfolioImage")
    title = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to="organizers/portfolio/")
    caption = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    service = models.CharField(max_length=50, blank=True)
    event_category = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=50, blank=True)
    locality = models.CharField(max_length=100, blank=True)
    price = models.CharField(max_length=100, blank=True)
    availability = models.CharField(max_length=100, blank=True, default="Available")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.organizer.company} - {self.service or 'Post'} ({self.id})"


class PostImage(models.Model):
    post = models.ForeignKey(PortfolioImage, on_delete=models.CASCADE, related_name="additional_images")
    image = models.ImageField(upload_to="organizers/portfolio/gallery/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Gallery image for post #{self.post_id}"


class PostLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liked_posts")
    post = models.ForeignKey(PortfolioImage, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_user_post_like')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} liked post {self.post.id}"


class SavedPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_posts")
    post = models.ForeignKey(PortfolioImage, on_delete=models.CASCADE, related_name="saved_by_users")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_user_saved_post')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} saved post {self.post.id}"


class ViewHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="view_history")
    post = models.ForeignKey(PortfolioImage, on_delete=models.CASCADE, related_name="views")
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_user_post_view_history')
        ]
        ordering = ['-viewed_at']

    def __str__(self):
        return f"{self.user.username} viewed post {self.post.id}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    organizer = models.ForeignKey(OrganizerProfile, on_delete=models.CASCADE, related_name="received_bookings")
    post = models.ForeignKey(PortfolioImage, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings")
    service = models.CharField(max_length=100)
    event_type = models.CharField(max_length=100, blank=True)
    event_date = models.DateField()
    event_time = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=255)
    guests_count = models.PositiveIntegerField(null=True, blank=True)
    budget = models.CharField(max_length=100, blank=True)
    special_notes = models.TextField(blank=True)
    contact_phone = models.CharField(max_length=40, blank=True)
    contact_email = models.EmailField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking #{self.id} for {self.organizer.company} by {self.user.username} ({self.status})"