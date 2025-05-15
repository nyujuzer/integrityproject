export default async function (req, res) {
  try {
    console.log("yay")
    res.status(200).send("Cron job executed.");
  } catch (e) {
    console.log("nay")
    console.error(e);
    res.status(500).send("Cron job failed.");
  }
}