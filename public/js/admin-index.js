let menuicn = document.querySelector(".menuicn");
let nav = document.querySelector(".navcontainer");

menuicn.addEventListener("click", () => {
	nav.classList.toggle("navclose");
});

function removeImage(imageId) {
	fetch(`/admin-gallery/${imageId}`, {
		method: 'DELETE'
	})
	.then(response => {
		if (response.status === 200) {
			// Refresh the page after successful deletion
			window.location.reload();
		} else {
			console.error("Failed to delete image");
		}
	})
	.catch(error => {
		console.error("Error:", error);
	});
}