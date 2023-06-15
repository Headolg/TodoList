
exports.getFullDay  = function() {
  let today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  return today.toLocaleDateString("en-US", options);
}

exports.getDay = function() {
    let today = new Date();

    const options = {
        weekday: "long"
    };

    return today.toLocaleDateString("en-US", options);

}
