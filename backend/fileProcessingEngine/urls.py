from django.urls import path

from .views import (
    DocumentUploadView,
    SemanticSearchView
)



urlpatterns = [

    path(
        "/upload/",
        DocumentUploadView.as_view(),
        name="document-upload"
    ),
    path(
        "/search/",
        SemanticSearchView.as_view(),
        name="semantic-search"
    ),
]