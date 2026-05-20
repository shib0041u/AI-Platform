from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pgvector.django import CosineDistance

from .models import Document

from .serializers import (
    DocumentSerializer
)

from .utils.pdf_reader import (
    extract_text_from_pdf
)
from .models import (
    Document,
    DocumentChunk
)

from .utils.chunker import (
    chunk_text
)

from .services.embedding_service import (
    generate_embedding
)


class DocumentUploadView(APIView):

    def post(self, request):
        try:
            uploaded_file = request.FILES.get(
                "file"
            )
            if not uploaded_file:
                return Response(
                    {
                        "message": "No file uploaded"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # CREATE DOCUMENT
            document = Document.objects.create(
                file=uploaded_file,
                file_name=uploaded_file.name,
                raw_text=""
            )

            # EXTRACT TEXT
            extracted_text = extract_text_from_pdf(
                document.file.path
            )

            # SAVE EXTRACTED TEXT
            document.raw_text = extracted_text
            document.save()

            # CHUNK TEXT
            chunks = chunk_text(
                extracted_text
            )

            # GENERATE EMBEDDINGS
            for chunk in chunks:
                embedding = generate_embedding(
                    chunk
                )

                DocumentChunk.objects.create(
                    document=document,
                    chunk_text=chunk,
                    embedding=embedding
                )

            serializer = DocumentSerializer(
                document
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )


        except Exception as error:
            return Response(
                {
                    "error": str(error)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class SemanticSearchView(APIView):

    def post(self, request):
        try:
            query = request.data.get(
                "query"
            )
            if not query:
                return Response(
                    {
                        "message": "Query is required"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # GENERATE QUERY EMBEDDING
            query_embedding = generate_embedding(
                query
            )

            # VECTOR SEARCH
            chunks = DocumentChunk.objects.annotate(

                distance=CosineDistance(
                    "embedding",
                    query_embedding
                )
            ).order_by(
                "distance"
            )[:5]

            results = []

            for chunk in chunks:
                results.append({
                    "chunk": chunk.chunk_text,
                    "distance": chunk.distance
                })

            return Response(
                results,
                status=status.HTTP_200_OK
            )

        except Exception as error:
            return Response(
                {
                    "error": str(error)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )