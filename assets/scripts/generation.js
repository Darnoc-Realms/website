class Member {
  constructor(username, badges, status, join_date) {
    this.username = username;
    this.badges = badges;
    this.status = status;
    this.join_date = join_date;
  }

  change_status(status) {
    this.status = status;
  }
}

let members = [];

get_members_api();

function get_members_api() {
  fetch(`https://api.darnoc-realms.ml/v1/players/`)
    .then(resp => resp.json())
    .then(function(api_members) {
      api_members.forEach(member => {
        let this_members_badges = [];
        if (member.level.name == "admin" || member.level.name == "member") {
          this_members_badges.push(["MEMBER", "purple"]);
        }
        if (member.level.name == "admin") {
          this_members_badges.push(["ADMIN", "grey"]);
        }
        if (member.level.name == "entrant") {
          this_members_badges.push(["JOINING", "green"]);
        }
        const new_member = new Member(
          member.name,
          this_members_badges,
          0,
          member.timestamps.join
        );
        members.push(new_member);
      });
    })
    .then(function() {
      get_discord_api();
    })
    .catch(function(error) {
      console.log(error);
    });
}

function get_discord_api() {
  fetch(`https://discord.com/api/guilds/729961633258012675/widget.json`)
    .then(resp => resp.json())
    .then(data => data.members)
    .then(function(api_members) {
      api_members.forEach(api_member => {
        const index = members.findIndex(x => x.username == api_member.username);
        if (index != -1) {
          members[index].change_status(1);
        }
      });
    })
    .then(function() {
      get_world_api();
    })
    .catch(function(error) {
      console.log(error);
    });
}

function get_world_api() {
  fetch(`https://map.darnoc-realms.ml/up/world/world/1612469985598`)
    .then(resp => resp.json())
    .then(data => data.players)
    .then(function(api_players) {
      api_players.forEach(api_player => {
        const index = members.findIndex(x => x.username == api_player.name);
        if (index != -1) {
          members[index].change_status(2);
        }
      });
    })
    .then(function() {
      sort_members();
      update_online_count();
      members.forEach((member, i) => {
        setTimeout(() => {
          create_row(member);
        }, i * 30);
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}

function sort_members() {
  members.sort(function(a, b) {
    return a.join_date - b.join_date;
  });

  members.sort(function(a, b) {
    return b.status - a.status;
  });
}

function create_row(member) {
  const table = document.getElementById("member_table");
  let row = document.createElement("tr");
  row.setAttribute("id", `user_${member.username}`);

  // Image
  let image_cell = document.createElement("td");
  let img = document.createElement("img");
  img.setAttribute("class", "player_avatar");
  img.setAttribute("src", `https://mc-heads.net/avatar/${member.username}`);
  img.setAttribute("loading", "lazy");
  image_cell.appendChild(img);
  row.appendChild(image_cell);

  // Name
  let name_cell = document.createElement("td");
  let username = document.createElement("h4");
  username.innerText = member.username;
  name_cell.appendChild(username);
  row.appendChild(name_cell);

  // Badges
  let badges_cell = document.createElement("td");
  badges_cell.setAttribute("class", "badges");
  member.badges.forEach(badge => {
    let new_badge = document.createElement("div");
    new_badge.setAttribute("class", `badge ${badge[1]}`);
    new_badge.innerText = badge[0];
    badges_cell.appendChild(new_badge);
  });
  row.appendChild(badges_cell);

  // Status
  let status_cell = document.createElement("td");
  let status_div = document.createElement("div");
  status_div.setAttribute("class", "status");

  switch (member.status) {
    case 2:
      status_div.innerHTML =
        '<span class="status_dot ingame">•</span>Ingame';
      break;
    case 1:
      status_div.innerHTML = '<span class="status_dot online">•</span>Online';
      break;
    default:
      status_div.innerHTML = '<span class="status_dot offline">•</span>Offline';
  }
  status_cell.appendChild(status_div);
  row.appendChild(status_cell);

  // Joins
  let join_date_cell = document.createElement("td");
  let join_date_div = document.createElement("div");
  join_date_div.setAttribute("class", "join_date");
  join_date_div.innerHTML = `<p><span class="small">Joined</span><br>${format(
    member.join_date
  )}<span class="almost_full"> ago</span></p>`;
  join_date_cell.appendChild(join_date_div);
  row.appendChild(join_date_cell);

  table.appendChild(row);
}

function update_online_count() {
  let online_count = 0;
  const span = document.getElementById("member_count");

  members.forEach(member => {
    if (member.status > 0) {
      online_count++;
    }
  });

  span.innerHTML = `(${online_count}/${members.length} online)`;
}
