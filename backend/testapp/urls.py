from django.urls import path
from .views import TestView

urlpatterns = [
    path("dbtest", TestView.as_view()),
]