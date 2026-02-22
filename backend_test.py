#!/usr/bin/env python3
"""
Y-Store Marketplace Backend API Testing
Tests all key APIs: products, categories, admin login, search suggestions
"""

import requests
import json
import sys
from datetime import datetime
import time

# Use public endpoint from frontend env
BASE_URL = "https://full-stack-setup-18.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class YStoreAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": response_data
        }
        self.results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {message}")

    def test_api_endpoint(self, method, endpoint, expected_status=200, data=None, headers=None):
        """Generic API test method"""
        url = f"{API_BASE}/{endpoint}"
        test_headers = {"Content-Type": "application/json"}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers["Authorization"] = f"Bearer {self.token}"

        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=test_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=test_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}

            return success, response_data, response.status_code
        except Exception as e:
            return False, {"error": str(e)}, 0

    def test_products_api(self):
        """Test /api/products endpoint - should return products"""
        print("\n🛍️  Testing Products API...")
        
        success, data, status_code = self.test_api_endpoint("GET", "products")
        
        if success:
            products = data.get("products", data.get("items", []))
            total = data.get("total", len(products))
            
            if len(products) >= 40:
                self.log_result(
                    "Products API - Count Check",
                    True,
                    f"Found {len(products)} products (≥40 as expected), total: {total}"
                )
            else:
                self.log_result(
                    "Products API - Count Check",
                    False,
                    f"Only found {len(products)} products, expected ≥40"
                )
            
            # Check if products have required fields
            if products:
                sample_product = products[0]
                required_fields = ["id", "name", "price"]
                missing_fields = [field for field in required_fields if field not in sample_product]
                
                if not missing_fields:
                    self.log_result(
                        "Products API - Structure",
                        True,
                        "Products have required fields (id, name, price)"
                    )
                else:
                    self.log_result(
                        "Products API - Structure",
                        False,
                        f"Products missing fields: {missing_fields}"
                    )
        else:
            self.log_result(
                "Products API - Basic",
                False,
                f"Failed to fetch products: Status {status_code}, Data: {data}"
            )

    def test_categories_api(self):
        """Test /api/categories endpoint"""
        print("\n📂 Testing Categories API...")
        
        success, data, status_code = self.test_api_endpoint("GET", "categories")
        
        if success:
            categories = data.get("categories", data if isinstance(data, list) else [])
            
            if len(categories) > 0:
                self.log_result(
                    "Categories API",
                    True,
                    f"Found {len(categories)} categories"
                )
                
                # Check category structure
                if categories:
                    sample_cat = categories[0]
                    if "name" in sample_cat:
                        self.log_result(
                            "Categories API - Structure",
                            True,
                            "Categories have name field"
                        )
                    else:
                        self.log_result(
                            "Categories API - Structure",
                            False,
                            "Categories missing name field"
                        )
            else:
                self.log_result(
                    "Categories API",
                    False,
                    "No categories found"
                )
        else:
            self.log_result(
                "Categories API",
                False,
                f"Failed to fetch categories: Status {status_code}, Data: {data}"
            )

    def test_admin_login(self):
        """Test admin login with provided credentials"""
        print("\n🔐 Testing Admin Login...")
        
        login_data = {
            "email": "admin@ystore.com",
            "password": "Admin123!"
        }
        
        success, data, status_code = self.test_api_endpoint(
            "POST", 
            "auth/login", 
            expected_status=200, 
            data=login_data
        )
        
        if success and "token" in data:
            self.token = data["token"]
            self.log_result(
                "Admin Login",
                True,
                "Successfully logged in as admin, received token"
            )
            return True
        else:
            self.log_result(
                "Admin Login",
                False,
                f"Login failed: Status {status_code}, Data: {data}"
            )
            return False

    def test_search_suggestions(self):
        """Test search suggestions API with Samsung query"""
        print("\n🔍 Testing Search Suggestions...")
        
        # Test empty query first
        success, data, status_code = self.test_api_endpoint("GET", "v2/search/suggest?q=")
        
        if success:
            self.log_result(
                "Search API - Empty Query",
                True,
                "Search suggestions work for empty query"
            )
        else:
            self.log_result(
                "Search API - Empty Query",
                False,
                f"Search API failed for empty query: Status {status_code}"
            )
        
        # Test Samsung query
        success, data, status_code = self.test_api_endpoint("GET", "v2/search/suggest?q=Samsung")
        
        if success:
            products = data.get("products", [])
            categories = data.get("categories", [])
            popular = data.get("popular", [])
            
            samsung_products = [p for p in products if "samsung" in p.get("name", "").lower()]
            
            if samsung_products:
                self.log_result(
                    "Search Suggestions - Samsung",
                    True,
                    f"Found {len(samsung_products)} Samsung products in suggestions"
                )
            else:
                self.log_result(
                    "Search Suggestions - Samsung",
                    False,
                    f"No Samsung products found in suggestions. Total products: {len(products)}"
                )
        else:
            self.log_result(
                "Search Suggestions - Samsung",
                False,
                f"Search API failed for Samsung: Status {status_code}, Data: {data}"
            )

    def test_admin_protected_endpoints(self):
        """Test admin-protected endpoints if login successful"""
        if not self.token:
            self.log_result(
                "Admin Protected Endpoints",
                False,
                "Skipped - No admin token available"
            )
            return
        
        print("\n🛡️  Testing Admin Protected Endpoints...")
        
        # Test admin dashboard or users endpoint
        success, data, status_code = self.test_api_endpoint("GET", "admin/dashboard")
        
        if success:
            self.log_result(
                "Admin Dashboard",
                True,
                "Admin dashboard accessible"
            )
        else:
            # Try different admin endpoints
            success, data, status_code = self.test_api_endpoint("GET", "admin/users")
            if success:
                self.log_result(
                    "Admin Users",
                    True,
                    "Admin users endpoint accessible"
                )
            else:
                self.log_result(
                    "Admin Protected Endpoints",
                    False,
                    f"Admin endpoints not accessible: Status {status_code}"
                )

    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Y-Store Backend API Tests")
        print(f"📡 Base URL: {BASE_URL}")
        print(f"🔗 API Base: {API_BASE}")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run core API tests
        self.test_products_api()
        self.test_categories_api()
        self.test_search_suggestions()
        
        # Test admin functionality
        login_success = self.test_admin_login()
        if login_success:
            self.test_admin_protected_endpoints()
        
        end_time = time.time()
        
        print("\n" + "=" * 60)
        print(f"📊 Test Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        print(f"   Duration: {end_time - start_time:.2f}s")
        
        # Save detailed results
        self.save_results()
        
        return self.tests_passed == self.tests_run

    def save_results(self):
        """Save test results to file"""
        results_file = "/app/test_reports/backend_test_results.json"
        
        summary = {
            "timestamp": datetime.now().isoformat(),
            "base_url": BASE_URL,
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": round(self.tests_passed / self.tests_run * 100, 1) if self.tests_run > 0 else 0,
            "results": self.results
        }
        
        try:
            with open(results_file, "w") as f:
                json.dump(summary, f, indent=2)
            print(f"💾 Results saved to: {results_file}")
        except Exception as e:
            print(f"❌ Failed to save results: {e}")

def main():
    """Main function"""
    tester = YStoreAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())