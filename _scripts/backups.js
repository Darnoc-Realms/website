class Backup {
  constructor(link, timestamp) {
    this.link = link;
    this.timestamp = timestamp;
  }
}

let backups = [];

get_members_api();

function get_members_api() {
  fetch(`https://api.darnoc-realms.ml/v1/backups/`)
    .then(resp => resp.json())
    .then(function(api_backups) {
      api_backups.forEach(backup => {
        const new_backup = new Backup(backup.link, backup.timestamp);
        backups.push(new_backup);
      });
    })
    .then(function() {
      sort_backups();
      update_backup_count();
      backups.forEach((backup, i) => {
        setTimeout(() => {
          create_row(backup);
        }, i * 30);
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}

function sort_backups() {
  backups.sort(function(a, b) {
    return a.timestamp - b.timestamp;
  });
}

function create_row(backup) {
  const table = document.getElementById("backups_table");
  let row = document.createElement("tr");

  // Date
  let date_cell = document.createElement("td");
  let date = document.createElement("h3");
  let t = new Date(backup.timestamp)
  const month_names = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];
  date.classList.add("date")
  var hours_and_minutes = t.toLocaleTimeString();
  hours_and_minutes = hours_and_minutes.replace(/:\d+ /, '').toLowerCase()
  date.innerText = `${month_names[t.getMonth()]} ${t.getDay()}, ${t.getFullYear()} ${hours_and_minutes}`;
  date_cell.appendChild(date);
  row.appendChild(date_cell);

  // Date Relative
  let date_relative_cell = document.createElement("td");
  let date_relative = document.createElement("h3");
  date_relative.classList.add("relative_date")
  date_relative.innerText = `${format(backup.timestamp)} ago`;
  date_relative_cell.appendChild(date_relative);
  row.appendChild(date_relative_cell);

  // Date
  let download_cell = document.createElement("td");
  download_cell.classList.add("download")
  download_cell.setAttribute("onclick", `window.open('${backup.link}', '_blank')`)
  let download_message = document.createElement("h3");
  download_message.innerHTML = 'Download<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
  download_cell.appendChild(download_message);
  row.appendChild(download_cell);

  table.appendChild(row);
}

function update_backup_count() {
  let count = backups.length;
  const span = document.getElementById("backup_count");
  span.innerHTML = `(${count} total)`;
}
