from django.http import JsonResponse

def health_check(request):
    """
    Simple health check endpoint that returns a 200 OK response.
    Used for container orchestration systems to verify the service is running.
    """
    return JsonResponse({"status": "ok"})
