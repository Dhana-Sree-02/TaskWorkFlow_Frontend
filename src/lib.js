import axios from 'axios';

export const apibaseurl = "http://localhost:8000";
export const imgurl = import.meta.env.BASE_URL;

// Helper to pre-populate local mock data if empty
function initMockData() {
    if (!localStorage.getItem("mock_users")) {
        localStorage.setItem("mock_users", JSON.stringify([
            { id: 1, fullname: "Administrator", phone: "+1 555-0199", email: "admin@taskworkflow.com", password: "admin", role: "Administrator" },
            { id: 2, fullname: "Jane Smith", phone: "+1 555-0144", email: "jane@taskworkflow.com", password: "password", role: "User" },
            { id: 3, fullname: "Alex Rivera", phone: "+1 555-0182", email: "alex@taskworkflow.com", password: "password", role: "User" }
        ]));
    }
    if (!localStorage.getItem("mock_tasks")) {
        localStorage.setItem("mock_tasks", JSON.stringify([
            { id: 101, name: "Establish styling system & design tokens", date: "2026-05-25", important: true, completed: true },
            { id: 102, name: "Integrate collapsible slide navigation menu", date: "2026-05-26", important: true, completed: false },
            { id: 103, name: "Conduct visual verification of responsive grids", date: "2026-05-28", important: false, completed: false }
        ]));
    }
}


export function callApi(reqMethod, apiUrl, jsonData, formData, responseHandler, jwtToken = "")
{
    initMockData();
    const headers = {};
    if (jwtToken) {
        headers["Token"] = jwtToken;
    }

    const config = {
        method: reqMethod,
        url: apiUrl,
        headers: headers,
        data: jsonData || formData || undefined
    };

    axios(config)
        .then((res) => {
            responseHandler(res.data);
        })
        .catch((err) => {
            console.warn("Backend not available, running in mock fallback mode:", err.message);
            
            // Handle Mock APIs based on url pattern
            const urlPath = apiUrl.replace(apibaseurl, "");
            
            // Quick mock routing
            if (urlPath.includes("/authservice/signin")) {
                const users = JSON.parse(localStorage.getItem("mock_users"));
                const email = jsonData.username;
                const password = jsonData.password;
                
                const found = users.find(u => u.email === email && u.password === password);
                if (found) {
                    localStorage.setItem("mock_active_user", JSON.stringify(found));
                    setTimeout(() => {
                        responseHandler({
                            code: 200,
                            message: "Successful authentication",
                            jwt: "mock-jwt-token-for-" + email
                        });
                    }, 400);
                } else {
                    setTimeout(() => {
                        responseHandler({
                            code: 401,
                            message: "Invalid email or password"
                        });
                    }, 400);
                }
            }
            else if (urlPath.includes("/authservice/signup")) {
                const users = JSON.parse(localStorage.getItem("mock_users"));
                // Check if email already exists
                if (users.find(u => u.email === jsonData.email)) {
                    setTimeout(() => {
                        responseHandler({ code: 400, message: "Email already registered!" });
                    }, 400);
                    return;
                }
                const newUser = {
                    id: users.length + 1,
                    fullname: jsonData.fullname,
                    phone: jsonData.phone,
                    email: jsonData.email,
                    password: jsonData.password,
                    role: "User"
                };
                users.push(newUser);
                localStorage.setItem("mock_users", JSON.stringify(users));
                setTimeout(() => {
                    responseHandler({
                        code: 200,
                        message: "Signup successful! You can now log in."
                    });
                }, 400);
            }
            else if (urlPath.includes("/authservice/uinfo")) {
                const active = JSON.parse(localStorage.getItem("mock_active_user")) || { fullname: "Demo Admin", role: "Admin" };
                const isAdmin = active.role === "Administrator" || active.role === "Admin" || parseInt(active.role) === 2;
                
                const menulist = [
                    { mid: 1, menu: "Dashboard", icon: "dashboard.png" },
                    { mid: 5, menu: "Profile", icon: "profile.png" }
                ];
                
                if (isAdmin) {
                    menulist.splice(1, 0, { mid: 4, menu: "User Manager", icon: "users.png" });
                } else {
                    menulist.splice(1, 0, { mid: 2, menu: "My Tasks", icon: "tasks.png" });
                }

                setTimeout(() => {
                    responseHandler({
                        code: 200,
                        fullname: active.fullname,
                        menulist: menulist
                    });
                }, 300);
            }
            else if (urlPath.includes("/authservice/profile")) {
                const active = JSON.parse(localStorage.getItem("mock_active_user")) || { fullname: "Demo Admin", phone: "+1 555-0199", email: "admin@taskworkflow.com", role: "Admin" };
                setTimeout(() => {
                    responseHandler({
                        user: [
                            { fullname: active.fullname, phone: active.phone, email: active.email },
                            { rolename: active.role === "Administrator" ? "Admin" : (active.role || "Admin") }
                        ]
                    });
                }, 300);
            }
            else if (urlPath.includes("/authservice/getallusers")) {
                const users = JSON.parse(localStorage.getItem("mock_users"));
                // url pattern: /authservice/getallusers/page/size
                // parse page and size from URL
                const parts = urlPath.split("/");
                const size = parseInt(parts[parts.length - 1]) || 2;
                const page = parseInt(parts[parts.length - 2]) || 1;
                
                const startIndex = (page - 1) * size;
                const paginatedUsers = users.slice(startIndex, startIndex + size);
                const totalPages = Math.ceil(users.length / size);
                
                setTimeout(() => {
                    responseHandler({
                        users: paginatedUsers,
                        page: page,
                        size: size,
                        totalpages: totalPages
                    });
                }, 300);
            }
            else if (urlPath.includes("/tasks")) {
                // Return dummy tasks
                const storedTasks = JSON.parse(localStorage.getItem("mock_tasks")) || [];
                const resTasks = storedTasks.map(t => ({
                    task_id: t.id,
                    title: t.name,
                    description: t.description || "Design and implement modules.",
                    priority: t.important ? "High" : "Medium",
                    due_date: t.date,
                    created_at: "2026-06-09T00:00:00",
                    current_stage: t.completed ? "Completed" : "In Progress",
                    assigned_to: { fullname: "Administrator", email: "admin@taskworkflow.com" }
                }));
                responseHandler(resTasks);
            }
            else if (urlPath.includes("/dashboard")) {
                responseHandler({
                    stats: { total_tasks: 3, completed_tasks: 1, pending_tasks: 2, high_priority_tasks: 2 },
                    stage_distribution: { labels: ["Backlog", "To Do", "In Progress", "Review", "Completed"], data: [0, 0, 2, 0, 1] },
                    user_task_load: { labels: ["Administrator"], data: [3] }
                });
            }
            else {
                // Generic catch-all mockup or print warning
                console.error("No mock route defined for URL: " + apiUrl);
                // Fail silently but notify
                alert("Network connection error: " + err.message);
            }
        });
}