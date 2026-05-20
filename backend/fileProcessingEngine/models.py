from django.db import models

# Create your models here.
from django.db import models

from pgvector.django import VectorField



class Document(models.Model):

    file = models.FileField(
        upload_to="documents/"
    )

    file_name = models.CharField(
        max_length=255
    )

    raw_text = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):

        return self.file_name



class DocumentChunk(models.Model):

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="chunks"
    )

    chunk_text = models.TextField()

    embedding = VectorField(
        dimensions=384
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )