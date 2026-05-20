
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import TestModel
from .serializers import TestSerializer


class TestView(APIView):


    # FETCH DATA
    def get(self, request):

        first_row = TestModel.objects.first()

        if first_row:

            serializer = TestSerializer(first_row)

            return Response(serializer.data)

        return Response(
            {"message": "No data found"},
            status=status.HTTP_404_NOT_FOUND
        )


    # CREATE OR UPDATE DATA
    def post(self, request):

        first_row = TestModel.objects.first()

        # UPDATE EXISTING ROW
        if first_row:

            serializer = TestSerializer(
                first_row,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():

                serializer.save()

                return Response({
                    "message": "Updated successfully",
                    "data": serializer.data
                })

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )


        # CREATE NEW ROW
        serializer = TestSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response({
                "message": "Created successfully",
                "data": serializer.data
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )