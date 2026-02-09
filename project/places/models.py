from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from tinymce.models import HTMLField
from slugify import slugify


class Place(models.Model):
    title = models.CharField(
        'Название',
        max_length=200,
        unique=True,
        db_index=True
    )
    description_short = models.TextField('Краткое описание', blank=True)
    description_long = HTMLField('Полное описание', blank=True)
    lng = models.FloatField(
        'Долгота',
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)]
    )
    lat = models.FloatField(
        'Широта',
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)]
    )
    slug = models.SlugField('URL', max_length=200, unique=True, blank=True)
    order = models.PositiveIntegerField(
        'Порядок',
        default=0,
        blank=False,
        null=False,
        db_index=True
    )

    class Meta:
        ordering = ['order']
        verbose_name = 'Локация'
        verbose_name_plural = 'Локации'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Image(models.Model):
    place = models.ForeignKey(
        Place,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='Локация'
    )
    image = models.ImageField('Изображение', upload_to='places/')
    order = models.PositiveIntegerField(
        'Порядок',
        default=0,
        blank=False,
        null=False,
        db_index=True
    )

    class Meta:
        ordering = ['order']
        verbose_name = 'Изображение'
        verbose_name_plural = 'Изображения'

    def __str__(self):
        return f'{self.place.title} - изображение {self.order}'

