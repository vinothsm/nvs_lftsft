from django.db import models


class EntityExtractor(models.Model):
    id = models.AutoField(primary_key=True)
    filename = models.CharField(null=False, max_length=100)
    entities = models.CharField(null=False, max_length=1000)
    extracted_text = models.JSONField(null=True)
    media = models.FileField(null=False, blank=True, upload_to="files")

    def __str__(self) -> str:
        return super().__str__()


class FileHandler(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    filepath = models.CharField(null=True, max_length=500)
    media = models.FileField(null=True, blank=True, upload_to="files")

    def __str__(self):
        return self.id, self.name, self.filepath
