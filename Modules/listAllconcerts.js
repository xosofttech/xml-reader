$(document).ready(function() {
  // Function to handle the "Save Changes" button click
  $(".btn-primary").on("click", function() {
      // Get the key of the current row from the modal ID
      const key = this.id.split("editModal")[1];

      // Get the values from the input fields
      const name = $("#editName" + key).val();
      const domain = $("#editDomain" + key).val();
      const section = $("#editSection" + key).val();

      // Your AJAX request here
      $.ajax({
          url: "/update", // Change this URL to your server endpoint for updating data
          type: "POST",
          dataType: "json",
          data: {
              key: key,
              name: name,
              domain: domain,
              section: section,
          },
          success: function(response) {
              // Handle the response from the server if needed
              console.log("Data updated successfully!");
          },
          error: function(error) {
              // Handle the error if the update fails
              console.error("Error updating data:", error);
          },
      });

      // Close the modal after saving changes
      $(this).closest(".modal").modal("hide");
  });
});



