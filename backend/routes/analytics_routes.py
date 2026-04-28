from flask import Blueprint, request
from services.analytics_service import analytics_service
from helpers import success_response, error_response

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics', methods=['GET'])
def get_analytics():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    days = int(request.args.get('days', 7))
    provider_id = request.args.get('provider_id')          # <-- NEW

    try:
        distribution = analytics_service.get_time_distribution(start_date, end_date, provider_id)
        daily_breakdown = analytics_service.get_daily_breakdown(days, provider_id)
        insights = analytics_service.get_insights(provider_id)

        analytics_data = {
            'distribution': distribution,
            'daily_breakdown': daily_breakdown,
            'insights': insights
        }
        return success_response(analytics_data, "Analytics retrieved successfully")
    except Exception as e:
        return error_response(f"Failed to retrieve analytics: {str(e)}", 500)

@analytics_bp.route('/analytics/distribution', methods=['GET'])
def get_distribution():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    provider_id = request.args.get('provider_id')          # <-- NEW

    try:
        distribution = analytics_service.get_time_distribution(start_date, end_date, provider_id)
        return success_response(distribution, "Distribution data retrieved successfully")
    except Exception as e:
        return error_response(f"Failed to retrieve distribution: {str(e)}", 500)

@analytics_bp.route('/analytics/daily', methods=['GET'])
def get_daily():
    days = int(request.args.get('days', 7))
    provider_id = request.args.get('provider_id')          # <-- NEW

    try:
        daily_data = analytics_service.get_daily_breakdown(days, provider_id)
        return success_response(daily_data, "Daily breakdown retrieved successfully")
    except Exception as e:
        return error_response(f"Failed to retrieve daily breakdown: {str(e)}", 500)

@analytics_bp.route('/analytics/insights', methods=['GET'])
def get_insights():
    provider_id = request.args.get('provider_id')          # <-- NEW

    try:
        insights = analytics_service.get_insights(provider_id)
        return success_response(insights, "Insights retrieved successfully")
    except Exception as e:
        return error_response(f"Failed to retrieve insights: {str(e)}", 500)