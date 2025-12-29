from django.urls import path
from .views import test_api,upload_excel

urlpatterns = [
    path("test/", test_api),
    path("upload/",upload_excel),
]
