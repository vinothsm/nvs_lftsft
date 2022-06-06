from django import forms
from .models import FileHandler, TestForm, EntityExtractor

class UploadFileForm(forms.ModelForm):
    class Meta:
        model = FileHandler
        fields = ["media"]

    def save(self, commit=True):
        instance = super(UploadFileForm, self).save(commit=False)
        instance.name = instance.media.file._get_name()
        instance.filepath = "static/files/"+instance.media.file._get_name()
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
        model = EntityExtractor
        fields = ["media", "entities"]

    def save(self, commit=True):
        instance = super(UploadEntityExtractor, self).save(commit=False)
        # instance.name = instance.media.file._get_name()
        instance.filepath = "static/files/"+instance.media.file._get_name()
        if commit:
            instance.save()
        return instance