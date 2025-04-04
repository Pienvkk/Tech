 document.addEventListener("DOMContentLoaded", async () => {
    const buttons = document.querySelectorAll(".button");

    buttons.forEach(async (button) => {
        const targetUser = button.dataset.userUsername; // Get target user from dataset

        try {
            // Fetch follow status for each user
            const statusResponse = await fetch(`/check-follow-status?targetUser=${targetUser}`);
            if (!statusResponse.ok) throw new Error("Failed to get follow status");

            let { isFollowing } = await statusResponse.json();
            updateButtonUI(button, isFollowing);

            button.addEventListener("click", async () => {
                try {
                    const response = await fetch(isFollowing ? "/unfollow" : "/follow", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ targetUser })
                    });

                    if (!response.ok) throw new Error(await response.text());

                    isFollowing = !isFollowing; // Toggle state
                    updateButtonUI(button, isFollowing);
                } catch (error) {
                    console.error("Error:", error);
                    alert("Error: " + error.message);
                }
            });
            
            function updateButtonUI(button, isFollowing) {
                if (isFollowing) {
                    button.textContent = "Unfollow";
                    button.style.backgroundColor = "red"; // Or other styling for unfollow
                } else {
                    button.textContent = "Follow";
                    button.style.backgroundColor = "green"; // Or other styling for follow
                }
            }
            
        } catch (error) {
            console.error("Error:", error);
        }
    });
});


// 6b063d6c-e86e-4d4b-accf-28529bd8253e.png data base image