from rest_framework import serializers
from .models import FileHandler, EntityExtractor, TestForm

class TestFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileHandler
        fields = ["id", "email", "media"]
class FileHandlerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileHandler
        fields = ["id", "name", "filepath"]



class EntityExtractorSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntityExtractor
        fields = ["id", "filename", "entities", "extracted_text", "media"]
