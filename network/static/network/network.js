function compose_box() {
    
    // Get username of the logged in user
    // If user is not logged in, index.html posts_view returns "anonimno"
    const user_username = JSON.parse(document.getElementById('user_username').textContent);
    
    // If user is logged in, create compose form
    if (user_username != 'anonimno') {
        const compose = document.createElement('form');
        compose.id = 'compose_id';
        compose.name ='csrfToken';
        compose.method = 'POST';
        compose.innerHTML = `
        <textarea class="form-control mt-4 mb-1" placeholder="What's happening?" rows="2" id="compose-text"></textarea>
        <input type="submit" class="btn btn-primary mb-2" value="Post"/>
        `;
        document.querySelector('#compose_view').append(compose);
    }
}


function load_posts(type, id_view) {
    
    const user_username = JSON.parse(document.getElementById('user_username').textContent);
    
    // GET the emails from the backend
    fetch(`/posts/${type}`)
    .then(response => response.json())
    .then(posts => {
        // Print posts
        console.log(posts);

        // Show all posts
        posts.forEach(spost => {
            const element = document.createElement('div');
            element.style.position = 'relative';
            element.id = `post_box_id_${spost.id}`;
            // Make divs out of post data
            let partHTML = `
            <div class="card bg-light mb-3">
            <div class="card-header">
            <div class="row">
            <div class="col-8"><a href="http://localhost:8000/profile/${spost.author}"><strong>${spost.author}</strong></a></div>`;

            // If user is logged in, add edit button
            if (spost.author == user_username) {
                partHTML += `
                <div class="col-4 text-right">
                <button class="btn btn-light btn-sm" id="btn_edit" value=${spost.id}>Edit</button>
                </div>
                `;
            } else {
                partHTML += '';
            }
            partHTML += `
                </div>
            </div>
            <div class="card-body" id="post_id_${spost.id}">${spost.text}</div>
                <div class="card-footer">
                    <div class="row ml-1">`;

            // Like - Unlike functionality
            if (spost.likers.includes(user_username)) {
                let post_liked = true;
                partHTML += `
                    <div class="col-6 row">
                        <button class="border-0" id="like" value=${spost.id}>
                            <div id="h_${spost.id}">❤️</div>
                        </button>`;
            } else {
                let post_liked = false;
                partHTML += `
                    <div class="col-6 row">
                        <button class="border-0" id="like" value=${spost.id}>
                            <div id="h_${spost.id}">🤍</div>
                        </button>`;
            }
            partHTML += `
                    <div id="l_${spost.id}">${spost.likers.length}</div>
                        </div>
                        <small class="col-6 text-right">${spost.timestamp}</small>
                    </div>
                </div>
            </div>`;

            // Append constructed HTML to 'posts_view' div in HTML file
            element.innerHTML = partHTML;
            document.querySelector(`#${id_view}`).append(element);
        });

        // Listen for "edit" button click. On click, get
        // the id of the post (this.value) and text from that post
        document.querySelectorAll('#btn_edit').forEach(btn => {
            btn.addEventListener('click', function() {
                // Get the post text from the id of the post
                // Call function using all arguments needed
                edit_post(this.value, post_text);
            });
        }); 

        // Listen for "like" button click. On click, get
        // the id of the post (this.value) and likers list
        if (user_username != 'anonimno') {
            document.querySelectorAll('#like').forEach(like => {
                like.addEventListener('click', function() {
                    // Call function using id and heart
                    heart = document.getElementById(`h_${this.value}`).innerHTML;
                    likes_no = document.getElementById(`l_${this.value}`).innerHTML;
                    like_post(this.value, heart, likes_no);
    
                });
            }); 
        } 
    });
}


function edit_post(id, text) {
    
    // Create a new box for editing the post
    const edit_box = document.createElement('div');
    edit_box.className = 'edit_box';
    edit_box.id = `edit_id_${id}`;
    document.querySelector(`#post_id_${id}`).append(edit_box)

    // Create a form inside the box
    const edit_input = document.createElement('form');
    edit_input.id = 'edit_id';
    edit_input.name ='csrfToken';
    edit_input.method = 'PUT';
    edit_input.innerHTML = `
    <textarea class="form-control mt-4 mb-1" rows="2" id="edit_text">${text}</textarea>
    <input type="submit" class="btn btn-primary mb-2" value="Post"/>
    <button class="btn btn-light mb-2" id="cancel">Cancel</button>
    `;
    document.querySelector(`#edit_id_${id}`).append(edit_input);

    // When the edit box is created, listen for clicks
    // Clicking outside of the edit box or the cancel button, removes the edit box
    document.addEventListener('mouseup', function(e) {
        var container = document.getElementById(`edit_id_${id}`);
        const cancel = document.querySelector('#cancel');
        if (container && (!container.contains(e.target) || cancel.contains(e.target))) {
            container.parentNode.removeChild(container);
        }
    });
    // Fetch data using the PUT method
    if (document.querySelector('#edit_id') != null) { 
        document.querySelector('#edit_id').onsubmit = function() {
            const edit_text = document.querySelector('#edit_text').value;
            fetch('/edit', {
                method: 'PUT',
                headers: {'X-CSRFToken': document.getElementById('csrf').querySelector('input').value},
                    body: JSON.stringify({
                        id: id,
                        text: edit_text
                    })
            })
            .then(response => response.json())
            .then(result => {
                // Print message
                console.log(result);
                // Don't reload whole page, only update current post with the text
                document.getElementById(`post_id_${id}`).innerHTML = `${edit_text}`;
            });
            return false;
        }
    }
}


function like_post(id, heart) {
    fetch('/like', {
        method: 'PUT',
        headers: {'X-CSRFToken': document.getElementById('csrf').querySelector('input').value},
            body: JSON.stringify({
                id: id,
                heart: heart
            })
    })
    .then(response => response.json())
    .then(result => {
        // Print message
        console.log(result);
        // Don't reload whole page, only update heart icon and number of likes
        likes_no = parseInt(document.getElementById(`l_${id}`).innerHTML);
        if (heart === '🤍') {
            likes_no += 1;
            document.getElementById(`h_${id}`).innerHTML = '❤️';
            document.getElementById(`l_${id}`).innerHTML = likes_no;
        } else if (heart === '❤️') {
            likes_no -= 1;
            document.getElementById(`h_${id}`).innerHTML = '🤍';
            document.getElementById(`l_${id}`).innerHTML = likes_no;
        } else {
            location.reload();
        }
    });
}


function show_all_posts() {
    compose_box();
    load_posts('all', id_view);
}


function profile_posts() {
    // Get all data from backend
    const profile_username = JSON.parse(document.getElementById('profile_username').textContent);
    const able_to_follow = JSON.parse(document.getElementById('able_to_follow').textContent);
    const following_number = JSON.parse(document.getElementById('following_number').textContent);
    const followers_number = JSON.parse(document.getElementById('followers_number').textContent);

    const user_username = JSON.parse(document.getElementById('user_username').textContent);

    const profile = document.createElement('div');
    profile.className = 'card mt-4 p-2';
    let partHTML = `
        <div class="row">
            <div class="col-4">
                <h3 class="pt-4 pl-4">${profile_username.toUpperCase()}</h3>`;

    // Follow or Unfollow
    if (able_to_follow === "yes") {
        partHTML += `
            <button class="btn btn-primary btn-sm ml-4" id="btn_follow">Follow</button>
        `;
    } else if (able_to_follow === "no") {
        partHTML += `
            <button class="btn btn-primary btn-sm ml-4" id="btn_follow">Unfollow</button>
        `;
    } else {
        partHTML += ``;
    }
    partHTML += `
            </div>
            <div class="col-4">
                <h6 class="pt-4">Following</h6>
                <p>${following_number}</p>
            </div>
            <div class="col-4">
                <h6 class="pt-4">Followers</h6>
                <p>${followers_number}</p>
            </div>
        </div>
        `;
    profile.innerHTML = partHTML
    document.querySelector('#profile_stats').append(profile);

    // Fetch data using the PUT method
    if (document.querySelector('#btn_follow') != null) { 
        document.querySelector('#btn_follow').onclick = function() {
            console.log('click');
            fetch('/follow', {
                method: 'PUT',
                headers: {'X-CSRFToken': document.getElementById('csrf').querySelector('input').value},
                    body: JSON.stringify({
                        user_username: user_username,
                        profile_username: profile_username
                    })
            })
            .then(response => response.json())
            .then(result => {
                // Print message
                console.log(result);
                // Reload page
                location.reload()
            });
            return false;
        }
    }

    if (profile_username === user_username) {
        compose_box();
    }
    load_posts(profile_username, id_view);
}


function following_posts() {
    load_posts('following', id_view);


}


function compose_box_fetch() {
    const user_username = JSON.parse(document.getElementById('user_username').textContent);
    document.querySelector('#compose_id').onsubmit = function() {
        const text = document.querySelector('#compose-text').value;
        // Send data to backend using POST method - create new post
        fetch('/compose', {
            method: 'POST',
            headers: {'X-CSRFToken': document.getElementById('csrf').querySelector('input').value},
            body: JSON.stringify({
                author: user_username,
                text: text
            })
        })
        .then(response => response.json())
        .then(result => {
            // Reload page
            location.reload()
        });
        return false;
    }
}


document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('#posts_view') != null) {
        // If div with the posts_view exists, call function to show all posts
        show_all_posts(id_view='posts_view');
    }

    // Clicking the "Following" link calls following posts function
    if (document.querySelector('#following_view') != null) {
        following_posts(id_view='following_view'); 
    }

    // Clicking on any usernme call functions that shows profile page elements
    if (document.querySelector('#profile_view') != null) { 
        profile_posts(id_view='profile_view')
    }

    // If compose  box is created, call function for "onsubmit" functionality
    if (document.querySelector('#compose_id') != null) { 
        compose_box_fetch()
    }
});