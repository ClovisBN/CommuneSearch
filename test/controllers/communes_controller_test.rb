require "test_helper"

class CommunesControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get communes_show_url
    assert_response :success
  end
end
