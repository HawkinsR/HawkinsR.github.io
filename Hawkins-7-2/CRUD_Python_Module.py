from pymongo import MongoClient 
from bson.objectid import ObjectId 

class AnimalShelter(object): 
    """ CRUD operations for Animal collection in MongoDB """ 

    def __init__(self, username = 'aacuser', password = 'aacUserPassword'): 
        # Connection Variables 
        USER = username 
        PASS = password 
        HOST = 'localhost' 
        PORT = 27017 
        DB = 'aac' 
        COL = 'animals'
        # Initialize Connection 
        self.client = MongoClient('mongodb://%s:%s@%s:%d' % (USER,PASS,HOST,PORT)) 
        self.database = self.client['%s' % (DB)] 
        self.collection = self.database['%s' % (COL)] 

    # A method to return the next available record number for use in the create method
    def get_next_record_number(self):
        return self.collection.count_documents({}) + 1
    
    # Complete this create method to implement the C in CRUD. 
    def create(self, data):
        if data is not None: 
            try:
                data.update({"rec_num": self.get_next_record_number()})
                self.database.animals.insert_one(data)  # data should be dictionary
                return True
            except Exception as e:
                print(f"An error occurred during write: {e}")
                return False
        else:
            return False

    # Create method to implement the R in CRUD.
    def read(self, query):
        if query is not None:
            try:
                return list(self.database.animals.find(query))
            except Exception as e:
                print(f"An error occurred during read: {e}")
                return []
        else:
            print("Query parameter is None. Pass an empty dict {{}} to return all records.")
            return []

    # Update method to implement the U in CRUD.
    def update(self, query, update_data):
        if query is not None and update_data is not None:
            try:
                result = self.database.animals.update_many(query, update_data)
                return result.modified_count # return the number of modified documents
            except Exception as e:
                print(f"An error occurred during update: {e}")
                return -1 # return -1 if update fails
        else:
            print("Query or update_data parameter is None.")
            return -1 # return -1 if missing parameters

    # Delete method to implement the D in CRUD.
    def delete(self, query):
        if query is not None:
            try:
                result = self.database.animals.delete_many(query)
                return result.deleted_count # return the number of deleted documents
            except Exception as e:
                print(f"An error occurred during delete: {e}")
                return -1 # return -1 if delete fails
        else:
            print("Query parameter is None.")
            return -1 # return -1 if missing parameters