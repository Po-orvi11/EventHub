from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from .models import (
    Profile,
    OrganizerProfile,
    PortfolioImage,
    PostLike,
    SavedPost,
    ViewHistory,
    Booking,
)
import datetime

class EventHubAPITests(APITestCase):
    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(username="client1", password="password123", email="client1@example.com")
        self.user2 = User.objects.create_user(username="client2", password="password123", email="client2@example.com")
        self.organizer_user = User.objects.create_user(username="organizer1", password="password123", email="org@example.com")

        # Create Organizer Profile
        self.organizer = OrganizerProfile.objects.create(
            user=self.organizer_user,
            company="Royal Weddings & Events",
            bio="We create unforgettable wedding celebrations.",
            address="123 Palace Road",
            location="Mumbai, Pune",
            phone="9876543210",
            email="contact@royalweddings.com",
            services=["Decoration", "Catering", "Photography"],
            rating=4.8
        )

        # Create a dummy image for testing
        dummy_image = SimpleUploadedFile(
            name="test_image.jpg",
            content=b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x05\x04\x04\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b",
            content_type="image/jpeg"
        )

        # Create Posts
        self.post1 = PortfolioImage.objects.create(
            organizer=self.organizer,
            image=dummy_image,
            caption="Grand wedding stage decoration with roses",
            service="Decoration",
            city="Mumbai"
        )

        dummy_image2 = SimpleUploadedFile(
            name="test_image2.jpg",
            content=b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x05\x04\x04\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b",
            content_type="image/jpeg"
        )

        self.post2 = PortfolioImage.objects.create(
            organizer=self.organizer,
            image=dummy_image2,
            caption="Traditional luxury catering spread",
            service="Catering",
            city="Pune"
        )

    # ------------------ LIKES TESTS ------------------
    def test_toggle_like(self):
        self.client.force_authenticate(user=self.user1)
        url = f"/api/post/{self.post1.id}/like/"

        # First like
        res = self.client.post(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["liked"])
        self.assertEqual(res.data["likes_count"], 1)
        self.assertTrue(PostLike.objects.filter(user=self.user1, post=self.post1).exists())

        # Toggle unlike
        res2 = self.client.post(url)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data["liked"])
        self.assertEqual(res2.data["likes_count"], 0)
        self.assertFalse(PostLike.objects.filter(user=self.user1, post=self.post1).exists())

    def test_liked_posts_list(self):
        PostLike.objects.create(user=self.user1, post=self.post1)
        self.client.force_authenticate(user=self.user1)

        res = self.client.get("/api/liked-posts/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["id"], self.post1.id)

    # ------------------ SAVED POSTS TESTS ------------------
    def test_toggle_save_post(self):
        self.client.force_authenticate(user=self.user1)
        url = f"/api/post/{self.post1.id}/save/"

        # Save post
        res = self.client.post(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["saved"])
        self.assertTrue(SavedPost.objects.filter(user=self.user1, post=self.post1).exists())

        # Unsave post
        res2 = self.client.post(url)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data["saved"])
        self.assertFalse(SavedPost.objects.filter(user=self.user1, post=self.post1).exists())

    def test_saved_posts_list(self):
        SavedPost.objects.create(user=self.user1, post=self.post1)
        self.client.force_authenticate(user=self.user1)

        res = self.client.get("/api/saved-posts/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["post"]["id"], self.post1.id)

    # ------------------ VIEW HISTORY TESTS ------------------
    def test_view_history_recorded_on_detail_view(self):
        self.client.force_authenticate(user=self.user1)
        url = f"/api/post/{self.post1.id}/"

        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["caption"], self.post1.caption)
        self.assertTrue(ViewHistory.objects.filter(user=self.user1, post=self.post1).exists())

        # Check view history endpoint
        history_res = self.client.get("/api/history/")
        self.assertEqual(history_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(history_res.data), 1)
        self.assertEqual(history_res.data[0]["post"]["id"], self.post1.id)

    def test_clear_view_history(self):
        ViewHistory.objects.create(user=self.user1, post=self.post1)
        ViewHistory.objects.create(user=self.user1, post=self.post2)
        self.client.force_authenticate(user=self.user1)

        # Clear all
        res = self.client.delete("/api/history/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(ViewHistory.objects.filter(user=self.user1).count(), 0)

    def test_delete_single_history_item(self):
        ViewHistory.objects.create(user=self.user1, post=self.post1)
        ViewHistory.objects.create(user=self.user1, post=self.post2)
        self.client.force_authenticate(user=self.user1)

        res = self.client.delete(f"/api/history/{self.post1.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(ViewHistory.objects.filter(user=self.user1, post=self.post1).exists())
        self.assertTrue(ViewHistory.objects.filter(user=self.user1, post=self.post2).exists())

    # ------------------ SEARCH & RECOMMENDATION TESTS ------------------
    def test_search_posts_query(self):
        # Search by specific keyword in post1 caption
        res = self.client.get("/api/posts/?q=roses")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["id"], self.post1.id)

        # Search by company name keyword (matches both posts)
        res_company = self.client.get("/api/posts/?q=Royal")
        self.assertEqual(res_company.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_company.data), 2)

    def test_search_posts_by_service_and_city(self):
        res = self.client.get("/api/posts/?service=Catering&city=Pune")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["id"], self.post2.id)

    def test_recommendations_endpoint(self):
        res = self.client.get("/api/posts/recommendations/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("popular", res.data)
        self.assertIn("recent", res.data)
        self.assertIn("by_category", res.data)
        self.assertIn("top_organizers", res.data)

    def test_categories_endpoint(self):
        res = self.client.get("/api/categories/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("services", res.data)
        self.assertIn("cities", res.data)
        self.assertIn("Decoration", res.data["services"])
        self.assertIn("Mumbai", res.data["cities"])

    # ------------------ BOOKINGS TESTS ------------------
    def test_create_and_retrieve_booking(self):
        self.client.force_authenticate(user=self.user1)

        booking_data = {
            "organizer": self.organizer.id,
            "post": self.post1.id,
            "service": "Decoration",
            "event_date": str(datetime.date.today() + datetime.timedelta(days=30)),
            "event_time": "18:00",
            "location": "Grand Ballroom, Mumbai",
            "guests_count": 250,
            "budget": "50000",
            "special_notes": "Floral pastel theme required",
            "contact_phone": "9998887776",
            "contact_email": "client1@example.com"
        }

        # Create
        res = self.client.post("/api/bookings/", booking_data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        booking_id = res.data["id"]
        self.assertEqual(res.data["status"], "PENDING")
        self.assertEqual(res.data["organizer_company"], "Royal Weddings & Events")

        # Client lists their bookings
        list_res = self.client.get("/api/bookings/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)
        self.assertEqual(list_res.data[0]["id"], booking_id)

        # Organizer lists their received bookings
        self.client.force_authenticate(user=self.organizer_user)
        org_bookings_res = self.client.get("/api/organizer/bookings/")
        self.assertEqual(org_bookings_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(org_bookings_res.data), 1)
        self.assertEqual(org_bookings_res.data[0]["id"], booking_id)

        # Organizer confirms the booking
        update_res = self.client.patch(f"/api/bookings/{booking_id}/", {"status": "CONFIRMED"})
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data["status"], "CONFIRMED")

        # Another unrelated user cannot access this booking
        self.client.force_authenticate(user=self.user2)
        unauth_res = self.client.get(f"/api/bookings/{booking_id}/")
        self.assertEqual(unauth_res.status_code, status.HTTP_403_FORBIDDEN)
