//HTTP request get,get/id,post,put/id, delete/id
async function LoadData() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json()
        let body = document.getElementById("table-body");
        body.innerHTML = "";
        for (const post of posts) {
            const isDeleted = post.isDeleted === true;
            const style = isDeleted ? "text-decoration: line-through; opacity: 0.6;" : "";
            body.innerHTML += `<tr style="${style}">
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>
                    ${!isDeleted ? `<input type='submit' value='delete' onclick='Delete(${post.id})'/>` : ''}
                    <input type='submit' value='comments' onclick='LoadComments(${post.id})'/>
                </td>
            </tr>`
        }
        return false;
    } catch (error) {
        console.log(error);
    }
}

async function getNextId() {
    let res = await fetch('http://localhost:3000/posts');
    let posts = await res.json();
    if (posts.length === 0) return "1";
    let maxId = Math.max(...posts.map(p => parseInt(p.id)));
    return String(maxId + 1);
}

async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;
    
    if (!id) {
        id = await getNextId();
    }
    
    let getItem = await fetch("http://localhost:3000/posts/" + id);
    if (getItem.ok) {
        let res = await fetch('http://localhost:3000/posts/' + id,
            {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        title: title,
                        views: views,
                        isDeleted: false
                    }
                )
            })
        if (res.ok) {
            console.log("edit du lieu thanh cong");
        }
    } else {
        let res = await fetch('http://localhost:3000/posts',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        id: id,
                        title: title,
                        views: views,
                        isDeleted: false
                    }
                )
            })
    }
    if (res.ok) {
        console.log("them du lieu thanh cong");
    }
    LoadData();
}

async function Delete(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa không?")) return;
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            isDeleted: true
        })
    });
    if (res.ok) {
        console.log("xoa mem thanh cong");
    }
    LoadData();
}

// Comments CRUD functions
async function LoadComments(postId) {
    let res = await fetch(`http://localhost:3000/comments?postId=${postId}`);
    let comments = await res.json();
    let commentDiv = document.getElementById("comment-section");
    commentDiv.innerHTML = `<h3>Comments for Post ${postId}</h3>`;
    
    for (const comment of comments) {
        commentDiv.innerHTML += `
            <div style="border: 1px solid #ccc; margin: 5px; padding: 5px;">
                <p>${comment.text}</p>
                <input type='submit' value='Edit' onclick='EditComment(${comment.id})'/>
                <input type='submit' value='Delete' onclick='DeleteComment(${comment.id})'/>
            </div>
        `;
    }
    
    commentDiv.innerHTML += `
        <div style="margin-top: 10px;">
            <input type="text" id="comment_text" placeholder="Enter comment"/>
            <input type="submit" value="Add Comment" onclick="AddComment(${postId})"/>
        </div>
    `;
}

async function AddComment(postId) {
    let text = document.getElementById("comment_text").value;
    let res = await fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: text,
            postId: String(postId)
        })
    });
    if (res.ok) {
        LoadComments(postId);
    }
}

async function EditComment(commentId) {
    let newText = prompt("Enter new comment text:");
    if (newText) {
        let res = await fetch('http://localhost:3000/comments/' + commentId, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: newText
            })
        });
        if (res.ok) {
            LoadData();
        }
    }
}

async function DeleteComment(commentId) {
    if (confirm("Delete this comment?")) {
        let res = await fetch('http://localhost:3000/comments/' + commentId, {
            method: 'DELETE'
        });
        if (res.ok) {
            LoadData();
        }
    }
}

LoadData();