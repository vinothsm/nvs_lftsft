from django import forms
from .models import EntityExtractorV1
from .extractor import get_fulltext_from_pdf
import os
from pathlib import Path

class UploadDocuments(forms.ModelForm):
    class Meta:
        model = EntityExtractorV1
        fields = ["media", "entities",'operation']

    def save(self, commit=True):
        instance = super(UploadDocuments, self).save(commit=False)
        instance.filepath = os.path.join(Path(__file__).parent, "static/files/"+instance.media.file._get_name().replace(" ", "_"))
        instance.staticpath = "files/"+instance.media.file._get_name().replace(" ", "_")
        instance.filename = instance.media.file._get_name().replace(" ", "_")
        if commit:
            instance.save()
            instance.extracted_text = get_fulltext_from_pdf(instance.filepath)
        return instance
