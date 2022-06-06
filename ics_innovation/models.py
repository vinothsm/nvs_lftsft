from pyexpat import model
from django.db import models


class TestForm(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(null=False)
    media = models.FileField(null=False, blank=True, upload_to="files")

class EntityExtractor(models.Model):
    id = models.AutoField(primary_key=True)
    filepath = models.CharField(null=False, max_length=100)
    entities = models.CharField(null=False, max_length=1000)
    media = models.FileField(null=False, blank=True, upload_to="files")
    extracted_text = models.TextField(null=True)

    def __str__(self) -> str:
        return super().__str__()


class FileHandler(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    filepath = models.CharField(null=True, max_length=500)
    media = models.FileField(null=True, blank=True, upload_to="files")

    def __str__(self):
        return self.id, self.name, self.filepath
