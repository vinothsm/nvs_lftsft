from rest_framework import serializers
from .models import FileHandler

class TestFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileHandler
        fields = ["id", "email", "media"]
class FileHandlerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileHandler
        fields = ["id", "name", "filepath"]
