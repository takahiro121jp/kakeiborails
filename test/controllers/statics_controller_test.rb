require "test_helper"

class StaticsControllerTest < ActionDispatch::IntegrationTest
  test "should get setting" do
    get statics_setting_url
    assert_response :success
  end
end
