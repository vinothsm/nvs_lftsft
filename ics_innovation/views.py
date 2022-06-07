from django.http import FileResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from .forms import UploadEntityExtractor

@api_view(["POST"])
def upload_entity_req(request):
    if request.method == "POST":
        form = UploadEntityExtractor(request.POST, request.FILES)
        if form.is_valid():
            form = form.save()
            form.save()
            context={
                "page": "preview",
                "link": "files/test.pdf",
                "response": [
                    {"entity": "name of the entity", "val": "extracted value"}
                ],
                "staticpath": form.staticpath,
                "extracted_text": form.extracted_text

            }
            return render(request, 'ui_review.html', context=context)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "POST"])
def upload_page(request):
    if request.method == "GET":
        context={}
        return render(request, 'ui_upload.html', context=context)
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
