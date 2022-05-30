from base64 import decode
from email.headerregistry import ContentTypeHeader
from urllib import response

from django.http import HttpResponse, HttpResponseRedirect, FileResponse
from .models import FileHandler
from .serializers import FileHandlerSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from .forms import UploadFileForm
import os
from django.utils.encoding import smart_str


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

@api_view(["GET"])
def get_file(request, id):
    one_obj = FileHandler.objects.filter(pk=id)
    filename = "ics_innovation/uploads/Revised-Sales-Brochure-LIC-Saral-Jeevan-Bima-WEB.pdf"
    if not os.path.exists(filename):
        response = Response(status=status.HTTP_400_BAD_REQUEST)
        return response
    return FileResponse(open(filename, "rb"), content_type="application/pdf")

def home(request):
    context={}
    # return render(request, 'Entity-extraction.html', context)
    return render(request, 'ui_index.html', context)


def extraction_page(request):
    context={}
    print(request)
    return render(request, 'ui_entity_extraction.html', context)


def review_page(request):
    context={}
    print(request)
    return render(request, 'ui_review.html', context)


@api_view(["GET"])
def get_entities(request, id):
    # load the file path
    #     one_obj = FileHandler.objects.filter(pk=id)
    # extract
    # hit the analytics api
    #return the response
    pass
