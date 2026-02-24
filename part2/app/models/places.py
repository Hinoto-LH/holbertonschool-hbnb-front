#!/usr/bin/python3
import uuid
from datetime import datetime


class Place(BaseModel):
    def __init__(self, id, title, description, price, latitude, longitude, owner):
        self.id = id
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner

    @property
    def title(self):
        return self.title
    
    @title.setter
    def title(self, char):
        if not char or isinstance(char, str):
            raise TypeError("Le titre est obligatoire et doit etre une chaine de caractères.")
        if len(char) > 100:
            raise ValueError("Le titre ne peut pas dépasser 100 caractères.")
    
    @property
    def price(self):
        return self.price
    
    @price.setter
    def price(self, value):
        pass
    
    @property
    def longitude(self):
        return self.longitude
    
    @longitude.setter
    def longitude(self, value):
        pass
    
    @property
    def latitude(self):
        return self.latitude
    
    @latitude.setter
    def latitude(self, value):
        pass
    
    @property
    def owner(self):
        return self.owner
    
    @owner.setter
    def owner(self, user):
        pass


    def add_review(self, review):
        pass

    def add_amenity(self, amenity):
        pass

    def save(self):
        self.update_at = datetime.now()

    def repr(self):
        return f"<Place id={self.id} title='{self.title} owner={self.owner.id}>"