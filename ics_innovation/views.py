from django.http import FileResponse
from .models import FileHandler, EntityExtractor
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from .forms import UploadFileForm
import os
from .serializers import EntityExtractorSerializer

@api_view(["GET", "POST"])
def upload_file(request):
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            form = form.save()
            # form.data.name = request.FILES["media"]
            # form.data.filepath = "ics_innovation/uploads/"+request.FILES["media"]._get_name()
            form.save()
            return Response(status=status.HTTP_201_CREATED)
    return render(request, "index.html", {"form": UploadFileForm})


@api_view(["GET", "POST"])
def upload_entity_req(request):
    if request.method == "POST":
        return Response(status=status.HTTP_201_CREATED)
    if request.method == "GET":
        snippets = EntityExtractor.objects.all()
        serializer = EntityExtractorSerializer(snippets, many=True)
        return Response(serializer.data)


@api_view(["GET"])
def get_file(request, id):
    one_obj = FileHandler.objects.filter(pk=id)
    filename = "ics_innovation/uploads/Revised-Sales-Brochure-LIC-Saral-Jeevan-Bima-WEB.pdf"
    if not os.path.exists(filename):
        response = Response(status=status.HTTP_400_BAD_REQUEST)
        return response
    return FileResponse(open(filename, "rb"), content_type="application/pdf")

@api_view(["GET", "POST"])
def upload_page(request):
    if request.method == "GET":
        context={}
        return render(request, 'ui_upload.html', context=context)
    # return render(request, 'ui_index.html', context=context)
    if request.method == "POST":
        context={}
        return render(request, 'ui_upload.html', context=context)


def review_page(request):
    context={
        "page": "preview",
        "link": "files/test.pdf",
        "response": [
            {"entity": "name of the entity", "val": "extracted value"}
        ]
    }
    return render(request, 'ui_review.html', context=context)
