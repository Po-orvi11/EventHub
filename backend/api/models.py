from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Profile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE )
    firstname = models.TextField(null=True, blank=True)
    lastname = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=20,null=True,blank=True)
    city = models.CharField(max_length=100,null=True,blank=True)

    def __str__(self):
        return self.user.username

class OrganizerProfile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="organizers")
    company_name = models.CharField(max_length=200)
    bio = models.TextField()
    address = models.CharField(max_length=300)
    location = models.TextField()
    phone = models.CharField(max_length=40,blank=True)
    email = models.CharField(max_length=80,blank=True) 
    services = models.JSONField(
        default=list,
        blank=True
    )

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=0.0
    )

    def __str__(self):
        return self.company_name


class PortfolioImage(models.Model):

    organizer = models.ForeignKey(OrganizerProfile, on_delete=models.CASCADE, related_name="portfolioImage")
    image = models.ImageField(upload_to="organizers/portfolio/")
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.organizer.company_name}"