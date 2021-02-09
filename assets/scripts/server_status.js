function get_server_api() {
  fetch(`https://api.mcsrvstat.us/2/play.darnoc-realms.ml`)
  .then((resp) => resp.json())
  .then(function(data) {
    let server_status_dot = document.getElementById("server_status_dot");
    let server_status_message = document.getElementById("server_status_message");
    let server_status_version = document.getElementById("server_status_version");

    if (data.online) {
      server_status_dot.className = "status_dot online"
      server_status_message.innerText = "Online"

      server_status_version.innerText = `- ${data.version}`
    } else {
      server_status_dot.className = "status_dot down"
      server_status_message.innerText = "Offline"

      server_status_version.innerText = ""
    }
  })
  .then(function() {

  })
  .catch(function(error) {
    console.log(error);
  });
}
get_server_api()
