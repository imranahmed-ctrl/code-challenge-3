// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
  // Call the main function to initialize the app
  main();
});

function main() {
  // Display all posts when the page loads
  displayPosts();
  
  // Set up event listener for the new post form
  addNewPostListener();
  
  // Display the first post automatically
  displayFirstPost();
}

// Function to display all posts
function displayPosts() {
  fetch('http://localhost:3001/posts')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(posts => {
      const postList = document.getElementById('post-list');
      postList.innerHTML = ''; // Clear existing posts
      
      // Create a list item for each post
      posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.dataset.id = post.id;
        postItem.innerHTML = `<strong>${post.title}</strong> - ${post.author}`;
        
        // Add click event to show post details
        postItem.addEventListener('click', function() {
          handlePostClick(post.id);
        });
        
        postList.appendChild(postItem);
      });
    })
    .catch(error => {
      console.error('Error fetching posts:', error);
    });
}

// Function to handle when a post is clicked
function handlePostClick(postId) {
  fetch(`http://localhost:3001/posts/${postId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(post => {
      const postDetail = document.getElementById('about-post');
      
      // Highlight the selected post in the list
      document.querySelectorAll('.post-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === postId.toString()) {
          item.classList.add('active');
        }
      });
      
      // Display the post details
      postDetail.innerHTML = 
        `<h3>${post.title}</h3>
        <p><em>By ${post.author}</em></p>
        <p>${post.content}</p>
        <div class="post-actions">
          <button id="edit-btn" data-id="${post.id}">Edit</button>
          <button id="delete-btn" data-id="${post.id}">Delete</button>
        </div>
      `;
      
      // Set up event listeners for edit and delete buttons
      document.getElementById('edit-btn').addEventListener('click', function() {
        showEditForm(post);
      });
      
      document.getElementById('delete-btn').addEventListener('click', function() {
        deletePost(post.id);
      });
    })
    .catch(error => {
      console.error('Error fetching post:', error);
    });
}

// Function to display the first post when the page loads
function displayFirstPost() {
  fetch('http://localhost:3001/posts')
    .then(response => response.json())
    .then(posts => {
      if (posts.length > 0) {
        handlePostClick(posts[0].id);
      }
    })
    .catch(error => {
      console.error('Error fetching first post:', error);
    });
}

// Function to handle the new post form submission
function addNewPostListener() {
  const form = document.getElementById('new-post-form');
  
  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    
    // Get the form values
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const content = document.getElementById('content').value;
    
    // Create a new post object
    const newPost = {
      title: title,
      author: author,
      content: content
    };
    
    // Send the new post to the API using POST
    fetch('http://localhost:3001/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      // Refresh the post list and clear the form
      displayPosts();
      form.reset();
    })
    .catch(error => {
      console.error('Error adding new post:', error);
    });
  });
}

// Function to show the edit form
function showEditForm(post) {
  const editForm = document.getElementById('edit-post-form');
  
  // Fill the form with the current post data
  document.getElementById('edit-title').value = post.title;
  document.getElementById('edit-content').value = post.content;
  
  // Show the form
  editForm.classList.remove('hidden');
  
  // Set up the form submission
  editForm.onsubmit = function(event) {
    event.preventDefault();
    
    // Get the updated values
    const updatedTitle = document.getElementById('edit-title').value;
    const updatedContent = document.getElementById('edit-content').value;
    
    // Update the post using PATCH
    fetch(`http://localhost:3001/posts/${post.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: updatedTitle,
        content: updatedContent
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      // Refresh the post list and details
      displayPosts();
      handlePostClick(post.id);
      
      // Hide the edit form
      document.getElementById('edit-post-form').classList.add('hidden');
    })
    .catch(error => {
      console.error('Error updating post:', error);
    });
  };
  
  // Set up the cancel button
  document.getElementById('cancel-edit').onclick = function() {
    editForm.classList.add('hidden');
  };
}

// Function to delete a post using DELETE
function deletePost(postId) {
  if (confirm('Are you sure you want to delete this post?')) {
    fetch(`http://localhost:3001/posts/${postId}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      // Clear the post details display
      document.getElementById('about-post').innerHTML = 
        '<p class="no-post-selected">Select a post to view details</p>';
      
      // Refresh the post list
      displayPosts();
      
      // Try to display the first post if available
      fetch('http://localhost:3001/posts')
        .then(response => response.json())
        .then(posts => {
          if (posts.length > 0) {
            handlePostClick(posts[0].id);
          }
        });
    })
    .catch(error => {
      console.error('Error deleting post:', error);
    });
  }
}