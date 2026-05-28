from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Profile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    firstname = models.TextField(null=True, blank=True)
    lastname = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=20,null=True,blank=True)
    location = models.CharField(max_length=100,null=True,blank=True)

    def __str__(self):
        return self.user.username
