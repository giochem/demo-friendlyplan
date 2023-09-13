// - new goal
// - add goal (name, repeat: (every, week, once),
// end date)
// icon, color,
// - edit, remote
// - detail (productivity, longest streak, tracked)

// create id
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}
// Get the button that opens the modal
const modal = document.getElementById("modal");
const addGoal = document.getElementById("add-goal");
addGoal.addEventListener("click", () => {
  // display
  modal.style.display = "block";
});
// closes the modal
const modalClose = document.getElementById("modal-close");
modalClose.onclick = () => {
  // hidden
  modal.style.display = "none";
};

// save goal
const modalSave = document.getElementById("modal-save");
modalSave.onclick = () => {
  const name = document.getElementById("input__name").value;
  const repeat = document.getElementById("input__repeat").value;
  if (name) {
    const goals = JSON.parse(localStorage.getItem("goals"));
    // DD/MM/YYYY
    const today = new Date().toLocaleDateString("pt-PT");
    goals.push({
      id: uuidv4(),
      name,
      repeat,
      start: today,
      active: true,
      tracted: [],
    });

    // update local storage
    localStorage.setItem("goals", JSON.stringify(goals));
    // close modal
    modal.style.display = "none";
    location.reload();
  }
};

// calendar user display
const calendar = () => {
  const today = new Date();
  const dayOfToday = today.toString().split(" ")[0];

  const todayCalendar = document.getElementById("today-calendar");

  todayCalendar.innerHTML = `
  <div class="calendar__item calendar__item_today">
  <p class="item__day">${dayOfToday}</p>
  <p class="item__date">${today.getDate()}</p>
  </div>`;
  let nextDay = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const fullItemOnWindow = 12; // 12 + today (1)
  for (let i = 1; i <= fullItemOnWindow; i++) {
    const dayOfNextDay = nextDay.toString().split(" ")[0];
    todayCalendar.innerHTML += `
      <div class="calendar__item">
      <p class="item__day">${dayOfNextDay}</p>
      <p class="item__date">${nextDay.getDate()}</p>
      </div>`;
    nextDay = new Date(nextDay.getTime() + 24 * 60 * 60 * 1000);
  }
};
calendar();
// load goal
function loadGoals() {
  let goals = JSON.parse(localStorage.getItem("goals"));
  // get goal is not delete
  goals = goals.filter((e) => e.active == true);
  if (goals.length) {
    // open goals, hidden empty
    const display = document.getElementById("goals");
    //
    display.innerHTML = `<p class="goals_today">Today</p> `;
    // radio
    let hasFinish = "";
    let notFinish = "";
    let listGoals = "";
    goals.forEach((element) => {
      // DD/MM/YYYY
      const today = new Date().toLocaleDateString("pt-PT");

      // finish this goal today
      const isFinishGoalToday = element.tracted.find((date) => date == today);
      const repeat = element.repeat;
      // once start today, every day, every week
      if (
        (repeat == "every day" ||
          repeat == "every week" ||
          (repeat == "once" && element.start == today)) &&
        !isFinishGoalToday
      ) {
        notFinish += `
          <div class="goals__item">
          <div class="goals__item__finish" value="${element.id}">not</div>
          <p>${element.name}</p>
          <img class="goals__item__edit" value="${element.id}" src="./img/setting.png" alt="setting" />
          </div>`;
      }
      // finish goal
      if (isFinishGoalToday) {
        hasFinish += `
          <div class="goals__item finish__item">
          <div class="goals__item__finish" value="${element.id}">has</div>
          <p>${element.name}</p>
          <img class="goals__item__edit" value="${element.id}" src="./img/setting.png" alt="setting" />
          </div>`;
      }
    });
    listGoals = notFinish + hasFinish;
    display.innerHTML += listGoals;

    const hidden = document.getElementById("empty");
    hidden.style.display = "none";
    display.style.display = "block";
  } else {
    // open empty, hidden goals
    const display = document.getElementById("empty");
    const hidden = document.getElementById("goals");
    hidden.style.display = "none";
    display.style.display = "block";
  }
}

function loadLocalStore() {
  if (!localStorage.getItem("goals")) {
    localStorage.setItem("goals", JSON.stringify([]));
  }
  loadGoals();
  console.log(JSON.parse(localStorage.getItem("goals")));
}
loadLocalStore();

// finish goal
const radioGoal = document.getElementsByClassName("goals__item__finish");
for (let radio_i = 0; radio_i < radioGoal.length; radio_i++) {
  radioGoal[radio_i].onclick = () => {
    // id need update
    const id = radioGoal[radio_i].getAttribute("value");
    // goals
    const goals = JSON.parse(localStorage.getItem("goals"));
    // DD/MM/YYYY
    const today = new Date().toLocaleDateString("pt-PT");
    //push or remote today
    for (let goal_i = 0; goal_i < goals.length; goal_i++) {
      if (goals[goal_i].id == id) {
        const isDate = goals[goal_i].tracted.find((date) => date == today);
        if (isDate) {
          goals[goal_i].tracted = goals[goal_i].tracted.filter(
            (date) => date != today
          );
        } else {
          goals[goal_i].tracted.push(today);
        }
        break;
      }
    }
    localStorage.setItem("goals", JSON.stringify(goals));
    // load page
    location.reload();
  };
}
// Modal edit
// Get the button that opens the modal edit
const editGoals = document.getElementsByClassName("goals__item__edit");
const addGoalEdit = document.getElementById("modal-edit");
for (let i = 0; i < editGoals.length; i++) {
  editGoals[i].addEventListener("click", (e) => {
    // id of goal
    const id = e.target.getAttribute("value");
    // goals from local storage
    const goals = JSON.parse(localStorage.getItem("goals"));
    // find goal
    const goal = goals.find((goal) => goal.id == id);
    // set value to edit in session store (one page one edit)
    sessionStorage.setItem("editGoal", id);
    // add data to modal
    const name = document.getElementById("modal-edit-input-name");
    const repeat = document.getElementById("modal-edit-repeat");
    name.value = goal.name;
    repeat.innerHTML = goal.repeat;
    // current tracked
    let currentTracked = 0;
    // tracked
    let tracted = 0;
    // longest streak
    let longestStreak = 0;
    // DD/MM/YYYY -> MM/DD/YYYY
    const covertDDMMYYYYtoMMDDYYYY = (ddmmyyyy) => {
      const parts = ddmmyyyy.split("/");
      // month is 0-based, that's why we need dataParts[1] - 1
      return new Date(+parts[2], parts[1] - 1, +parts[0]);
    };
    switch (goal.repeat) {
      case "every day":
        const start = covertDDMMYYYYtoMMDDYYYY(goal.start);
        const today = covertDDMMYYYYtoMMDDYYYY(
          new Date().toLocaleDateString("pt-PT")
        );
        //  count stack before today
        tracted += (today - start) / (24 * 60 * 60 * 1000); // covert to day
        // tracked today

        if (
          goal.tracted[goal.tracted.length - 1] ==
          new Date().toLocaleDateString("pt-PT")
        ) {
          tracted += 1;
        }
        // check has date in tracted
        let dates = goal.tracted;
        if (dates.length >= 1) {
          // covert to number
          for (let date_i = 0; date_i < dates.length; date_i++) {
            dates[date_i] = covertDDMMYYYYtoMMDDYYYY(dates[date_i]).getTime();
          }
          // count streak latest
          let lastCurrentTracked = 1;
          for (let before_i = dates.length - 2; before_i >= 0; before_i--) {
            // date1 + 1 day = date2
            if (dates[before_i] + 24 * 60 * 60 * 1000 == dates[before_i + 1]) {
              lastCurrentTracked += 1;
              continue;
            }
            // not correct
            break;
          }
          // check is today, yesterday or not current streak
          const todayTracked = new Date();
          const yesterdayTracked = new Date(
            todayTracked.getTime() - 24 * 60 * 60 * 1000
          ); // 1 day
          const timeOfToday = new Date(
            covertDDMMYYYYtoMMDDYYYY(todayTracked.toLocaleDateString("pt-PT"))
          ).getTime();
          const timeOfYesterday = new Date(
            covertDDMMYYYYtoMMDDYYYY(
              yesterdayTracked.toLocaleDateString("pt-PT")
            )
          ).getTime();
          // display current streaked
          if (
            dates[dates.length - 1] == timeOfToday ||
            dates[dates.length - 1] == timeOfYesterday
          ) {
            currentTracked = lastCurrentTracked;
          }
        }

        // if (tracted.length >= 1) {
        //   let todayStreak = new Date().toLocaleDateString("pt-PT");
        //   let yesterdayStreak = new Date(
        //     new Date().getTime() - 24 * 60 * 60 * 1000// 1 day
        //   ).toLocaleDateString("pt-PT");
        //   if (tracted[tracted.length - 1] == todayStreak) {
        //     let beforeTracted = new Date(covertDDMMYYYYtoMMDDYYYY(yesterdayStreak).getTime() - 24 * 60 * 60 * 1000);
        //     for (
        //       let tracted_i = tracted.length - 2;
        //       tracted_i >= 0;
        //       tracted_i--
        //     ) {
        //       const check  = beforeTracted.
        //       if(tracted[tracted_i] == )
        //     }
        //   }
        //   if (tracted[tracted.length - 1] == yesterdayStreak) {
        //   }
        // }
        // longest streak
        // if (goal.tracted.length >= 1) {
        //   longestStreak = Math.max(1, longestStreak);
        //   let beforeDate = covertDDMMYYYYtoMMDDYYYY(goal.tracted[0]);
        //   for (
        //     let tracted_i = 1;
        //     tracted_i < goal.tracted.length;
        //     tracted_i++
        //   ) {
        //     const nextDateStreak = beforeDate + 24 * 60 * 60 * 1000; // + 1 day
        //     let nextDateTracted = covertDDMMYYYYtoMMDDYYYY(tracted[i]);
        //     if (nextDateStreak.toString() == nextDateTracted.toString()) {
        //       console.log(11);
        //     }
        //   }
        // }
        break;
      case "every week":
        const startWeek = covertDDMMYYYYtoMMDDYYYY(goal.start);
        const todayWeek = covertDDMMYYYYtoMMDDYYYY(
          new Date().toLocaleDateString("pt-PT")
        );
        //  count stack before today
        tracted += (todayWeek - startWeek) / (7 * 24 * 60 * 60 * 1000); // covert to week
        // tracked today
        if (
          goal.tracted[goal.tracted.length - 1] ==
          new Date().toLocaleDateString("pt-PT")
        ) {
          tracted += 1;
        }
        // check has date in tracted
        let datesWeek = goal.tracted;
        if (datesWeek.length >= 1) {
          // covert to number
          for (let date_i = 0; date_i < datesWeek.length; date_i++) {
            datesWeek[date_i] = covertDDMMYYYYtoMMDDYYYY(
              datesWeek[date_i]
            ).getTime();
          }
          // count streak latest
          let lastCurrentTrackedWeek = 1;
          for (let before_i = datesWeek.length - 2; before_i >= 0; before_i--) {
            // week1 + 7 day = week2
            if (
              datesWeek[before_i] + 7 * 24 * 60 * 60 * 1000 ==
              datesWeek[before_i + 1]
            ) {
              lastCurrentTrackedWeek += 1;
              continue;
            }
            // not correct
            break;
          }
          // check is today, yesterday or not current streak
          const todayTrackedWeek = new Date();
          const yesterdayTrackedWeek = new Date(
            todayTrackedWeek.getTime() - 7 * 24 * 60 * 60 * 1000
          ); // 7 day
          const timeOfTodayWeek = new Date(
            covertDDMMYYYYtoMMDDYYYY(
              todayTrackedWeek.toLocaleDateString("pt-PT")
            )
          ).getTime();
          const timeOfYesterdayWeek = new Date(
            covertDDMMYYYYtoMMDDYYYY(
              yesterdayTrackedWeek.toLocaleDateString("pt-PT")
            )
          ).getTime();
          // display current streaked
          if (
            datesWeek[datesWeek.length - 1] == timeOfTodayWeek ||
            datesWeek[datesWeek.length - 1] == timeOfYesterdayWeek
          ) {
            currentTracked = lastCurrentTrackedWeek;
          }
        }
        break;
      default:
        // tracked today
        if (
          goal.tracted[goal.tracted.length - 1] ==
          new Date().toLocaleDateString("pt-PT")
        ) {
          tracted += 1;
          currentTracked = 1;
        }
    }
    // productivity
    const productivityEditTracked = document.getElementById(
      "modal-edit-productivity"
    );
    const percent = Math.round((goal.tracted.length * 100) / tracted);
    if (percent) {
      productivityEditTracked.innerHTML = `${percent} %<p>Productivity</p>`;
    } else {
      productivityEditTracked.innerHTML = "--<p>Productivity</p>";
    }
    // current treaked
    const modalEditCurrentTracked = document.getElementById(
      "modal-edit-current-treaked"
    );
    modalEditCurrentTracked.innerHTML = `${currentTracked} Days <p>Current Streak</p>`;
    // tracted
    const modalEditTracked = document.getElementById("modal-edit-tracted");
    modalEditTracked.innerHTML = `${tracted} Days <p>Tracked</p>`;
    // display modal edit
    addGoalEdit.style.display = "block";
    // closes the modal
    const modalEditClose = document.getElementById("modal-edit-close");
    modalEditClose.onclick = () => {
      addGoalEdit.style.display = "none";
    };
  });
}
// save and break
const saveEditGoal = document.getElementById("modal-edit-save");
saveEditGoal.addEventListener("click", () => {
  // value of goal for user had edit
  const name = document.getElementById("modal-edit-input-name").value;
  if (name) {
    // goal from local store
    const goals = JSON.parse(localStorage.getItem("goals"));
    //  id to find goal need edit
    const id = sessionStorage.getItem("editGoal");
    // change goal
    for (let i = 0; i < goals.length; i++) {
      if (goals[i].id == id) {
        goals[i].name = name;
        break;
      }
    }
    // clear editNote in session store
    sessionStorage.removeItem("editGoal");
    // update local store
    localStorage.setItem("goals", JSON.stringify(goals));
    addGoalEdit.style.display = "none";
    location.reload();
  }
});
// delete a goal
const deleteNote = document.getElementById("modal-edit-delete");
deleteNote.addEventListener("click", () => {
  if (confirm("Bạn có chắc muốn xóa chứ ?")) {
    // goal from local store
    const goals = JSON.parse(localStorage.getItem("goals"));
    // id to find goal need edit
    const id = sessionStorage.getItem("editGoal");

    // change goal same id : active = false
    for (let i = 0; i < goals.length; i++) {
      if (goals[i].id == id) {
        goals[i].active = false;
        break;
      }
    }
    localStorage.setItem("goals", JSON.stringify(goals));

    // clear editGoal in session store
    sessionStorage.removeItem("editGoal");
    // break modal
    addGoalEdit.style.display = "none";
    location.reload();
  }
});
