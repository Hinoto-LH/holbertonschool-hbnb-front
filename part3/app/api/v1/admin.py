from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('admin', description='Admin operations')

# ── Models ──────────────────────────────────────────────────────────────────

user_model = api.model('AdminUser', {
    'first_name': fields.String(required=True, description='First name'),
    'last_name': fields.String(required=True, description='Last name'),
    'email': fields.String(required=True, description='Email'),
    'password': fields.String(required=True, description='Password')
})

user_update_model = api.model('AdminUserUpdate', {
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name'),
    'email': fields.String(description='Email'),
    'password': fields.String(description='Password')
})

amenity_model = api.model('AdminAmenity', {
    'name': fields.String(required=True, description='Name of the amenity')
})

place_model = api.model('AdminPlace', {
    'title': fields.String(description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(description='Price per night'),
    'latitude': fields.Float(description='Latitude'),
    'longitude': fields.Float(description='Longitude'),
    'amenities': fields.List(fields.String, description="List of amenities IDs")
})

review_model = api.model('AdminReview', {
    'text': fields.String(description='Text of the review'),
    'rating': fields.Integer(description='Rating (1-5)')
})


# ── Helper ───────────────────────────────────────────────────────────────────

def get_admin_or_403():
    """
    Returns (current_user, None) if admin,
    or (None, error_response) if not authenticated or not admin.
    """
    current_user_id = get_jwt_identity()
    current_user = facade.get_user(current_user_id)
    if not current_user or not current_user.is_admin:
        return None, ({'error': 'Admin privileges required'}, 403)
    return current_user, None


# ── USERS ────────────────────────────────────────────────────────────────────

@api.route('/users/')
class AdminUserList(Resource):
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def post(self):
        """Admin — Create a new user"""
        _, err = get_admin_or_403()
        if err:
            return err

        data = api.payload

        if facade.get_user_by_email(data['email']):
            return {'error': 'Email already registered'}, 400

        try:
            new_user = facade.create_user(data)
            return {
                'id': new_user.id,
                'first_name': new_user.first_name,
                'last_name': new_user.last_name,
                'email': new_user.email
            }, 201
        except ValueError as e:
            return {'error': str(e)}, 400


@api.route('/users/<user_id>')
class AdminUserResource(Resource):
    @api.expect(user_update_model, validate=True)
    @api.response(200, 'User successfully updated')
    @api.response(404, 'User not found')
    @api.response(400, 'Email already in use')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def put(self, user_id):
        """Admin — Update any user (email, password included)"""
        _, err = get_admin_or_403()
        if err:
            return err

        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        data = api.payload

        # Vérifier unicité du nouvel email si modifié
        new_email = data.get('email')
        if new_email and new_email != user.email:
            if facade.get_user_by_email(new_email):
                return {'error': 'Email already in use'}, 400

        try:
            updated = facade.update_user(user_id, data, is_admin=True)
            return {
                'id': updated.id,
                'first_name': updated.first_name,
                'last_name': updated.last_name,
                'email': updated.email
            }, 200
        except ValueError as e:
            return {'error': str(e)}, 400


# ── AMENITIES ────────────────────────────────────────────────────────────────

@api.route('/amenities/')
class AdminAmenityList(Resource):
    @api.expect(amenity_model, validate=True)
    @api.response(201, 'Amenity successfully created')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def post(self):
        """Admin — Create a new amenity"""
        _, err = get_admin_or_403()
        if err:
            return err

        try:
            new_amenity = facade.create_amenity(api.payload)
            return {'id': new_amenity.id, 'name': new_amenity.name}, 201
        except ValueError as e:
            return {'error': str(e)}, 400


@api.route('/amenities/<amenity_id>')
class AdminAmenityResource(Resource):
    @api.expect(amenity_model, validate=True)
    @api.response(200, 'Amenity updated successfully')
    @api.response(404, 'Amenity not found')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def put(self, amenity_id):
        """Admin — Update an amenity"""
        _, err = get_admin_or_403()
        if err:
            return err

        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {'error': 'Amenity not found'}, 404

        try:
            updated = facade.update_amenity(amenity_id, api.payload)
            return {'id': updated.id, 'name': updated.name}, 200
        except (ValueError, TypeError) as e:
            return {'error': str(e)}, 400


# ── PLACES ───────────────────────────────────────────────────────────────────

@api.route('/places/<place_id>')
class AdminPlaceResource(Resource):
    @api.expect(place_model)
    @api.response(200, 'Place updated successfully')
    @api.response(404, 'Place not found')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def put(self, place_id):
        """Admin — Update any place (ownership bypassed)"""
        _, err = get_admin_or_403()
        if err:
            return err

        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404

        try:
            facade.update_place(place_id, api.payload)
            return {'message': 'Place updated successfully'}, 200
        except ValueError as e:
            return {'error': str(e)}, 400

    @api.response(200, 'Place deleted successfully')
    @api.response(404, 'Place not found')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def delete(self, place_id):
        """Admin — Delete any place (ownership bypassed)"""
        _, err = get_admin_or_403()
        if err:
            return err

        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404

        facade.delete_place(place_id)
        return {'message': 'Place deleted successfully'}, 200


# ── REVIEWS ──────────────────────────────────────────────────────────────────

@api.route('/reviews/<review_id>')
class AdminReviewResource(Resource):
    @api.expect(review_model)
    @api.response(200, 'Review updated successfully')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def put(self, review_id):
        """Admin — Update any review (ownership bypassed)"""
        _, err = get_admin_or_403()
        if err:
            return err

        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        try:
            facade.update_review(review_id, api.payload)
            return {'message': 'Review updated successfully'}, 200
        except ValueError as e:
            return {'error': str(e)}, 400

    @api.response(200, 'Review deleted successfully')
    @api.response(404, 'Review not found')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def delete(self, review_id):
        """Admin — Delete any review (ownership bypassed)"""
        _, err = get_admin_or_403()
        if err:
            return err

        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        facade.delete_review(review_id)
        return {'message': 'Review deleted successfully'}, 200
    