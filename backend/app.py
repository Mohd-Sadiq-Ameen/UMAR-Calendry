from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from db import init_db
import razorpay

# Import existing blueprints
from routes.event_routes import event_bp
from routes.zoom_routes import zoom_bp
from routes.analytics_routes import analytics_bp
from routes.providers_routes import providers_bp
from routes.bookings_routes import bookings_bp

# Initialize Razorpay client with your test keys
RAZORPAY_KEY_ID = "rzp_test_SinpoViOQL7X6f"
RAZORPAY_KEY_SECRET = "ZPuyZxmmyhhzsLe5is6r8WqE"
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, origins=Config.CORS_ORIGINS)
    
    init_db()
    
    # Register existing blueprints
    app.register_blueprint(event_bp, url_prefix='/api')
    app.register_blueprint(zoom_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(providers_bp, url_prefix='/api')
    app.register_blueprint(bookings_bp, url_prefix='/api')
    
    # ----- Razorpay Payment Endpoints -----
    @app.route('/api/create-order', methods=['POST'])
    def create_order():
        """Create a Razorpay order for the given amount"""
        data = request.get_json()
        amount = data.get('amount')
        if not amount:
            return jsonify({'success': False, 'message': 'Amount is required'}), 400
        
        try:
            order = razorpay_client.order.create({
                'amount': int(amount) * 100,  # convert to paise
                'currency': 'INR',
                'payment_capture': 1
            })
            return jsonify({'success': True, 'order_id': order['id']})
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @app.route('/api/verify-payment', methods=['POST'])
    def verify_payment():
        """Verify Razorpay payment signature"""
        data = request.get_json()
        params = {
            'razorpay_payment_id': data.get('payment_id'),
            'razorpay_order_id': data.get('order_id'),
            'razorpay_signature': data.get('signature')
        }
        try:
            razorpay_client.utility.verify_payment_signature(params)
            # Optionally update booking status in your database here
            # e.g., update bookings set payment_status = 'paid' where booking_id = data.get('booking_id')
            return jsonify({'success': True, 'message': 'Payment verified successfully'})
        except Exception as e:
            return jsonify({'success': False, 'message': 'Signature verification failed'}), 400
    
    # Health check (keep as is)
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'healthy', 'message': 'Calendar API is running'}, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("=" * 50)
    print("🚀 Calendar & Productivity API Server")
    print("=" * 50)
    print("📍 Server running on: http://localhost:5000")
    print("=" * 50)
    print("\n✓ Ready to accept requests!\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)