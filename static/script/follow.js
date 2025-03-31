document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("button[data-username]").forEach(button => {
        button.addEventListener("click", async () => {
            const targetUser = button.dataset.username;
            const isFollowing = button.classList.contains("following"); // Check if user is followed

            try {
                const response = await fetch(isFollowing ? "/unfollow" : "/follow", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ targetUser })
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                // Toggle following state
                if (isFollowing) {
                    button.textContent = "Follow";
                    button.classList.remove("following");
                    button.classList.add("not-following");
                } else {
                    button.textContent = "Following";
                    button.classList.add("following");
                    button.classList.remove("not-following");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Error: " + error.message);
            }
        });
    });
});


// 6b063d6c-e86e-4d4b-accf-28529bd8253e.png data base image