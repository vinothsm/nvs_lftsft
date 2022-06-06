from django import forms
from .models import FileHandler, TestForm, EntityExtractorV1
from .extractor import get_text_from_file
import os
from pathlib import Path

class UploadFileForm(forms.ModelForm):
    class Meta:
        model = FileHandler
        fields = ["media"]

    def save(self, commit=True):
        instance = super(UploadFileForm, self).save(commit=False)
        instance.name = instance.media.file._get_name()
        instance.filepath = os.path.join(Path(__file__).parent, "static/files/"+instance.media.file._get_name())
        # import pdb; pdb.set_trace()
        if commit:
            instance.save()
        return instance


class UploadTestForm(forms.ModelForm):
    class Meta:
        model = TestForm
        fields = ["media", "email"]

    def save(self, commit=True):
        instance = super(UploadTestForm, self).save(commit=False)
        # instance.name = instance.media.file._get_name()
        # instance.filepath = "static/files/"+instance.media.file._get_name()
        if commit:
            instance.save()
        return instance

class UploadEntityExtractor(forms.ModelForm):
    class Meta:
        model = EntityExtractorV1
        fields = ["media", "entities"]

    def save(self, commit=True):
        instance = super(UploadEntityExtractor, self).save(commit=False)
        # instance.name = instance.media.file._get_name()
        instance.filepath = os.path.join(Path(__file__).parent, "static/files/"+instance.media.file._get_name())
        instance.staticpath = "files/"+instance.media.file._get_name()
        if commit:
            instance.save()
            instance.extracted_text = get_text_from_file(instance.filepath)
        return instance
