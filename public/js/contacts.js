(function (contacts) {
  "use strict";

  contacts.delete = (key) => {
    if (confirm("Are You Sure ?")) {
      fetch("/contacts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      }).then(() => {
        window.location.reload();
      });
    }
  };

  contacts.update = (key) => {
    window.location.assign("/contacts/edit/" + key);
  };
})((window.contacts = {}));
