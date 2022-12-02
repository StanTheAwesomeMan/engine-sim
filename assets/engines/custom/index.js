var liftarr = []
var anglearr = []
var step = 0

var lift = false
var gamma1 = false
var gamma2 = false
var duration1 = false
var duration2 = false
var steps = false

process.argv.forEach(function (val, index, array) {
  if (val == "--lift") lift = array[index + 1]
  if (val == "--gamma1") gamma1 = array[index + 1]
  if (val == "--gamma2") gamma2 = array[index + 1]
  if (val == "--duration1") duration1 = array[index + 1]
  if (val == "--duration2") duration2 = array[index + 1]
  if (val == "--steps") steps = array[index + 1]
});

if (
  lift == false
  || gamma1 == false
  || gamma2 == false
  || duration1 == false
  || duration2 == false
  || steps == false
) throw new Error("Error: Missing Arguments. Usage: node index.js --lift [meters] --gamma1 [float] --gamma2 [float] --duration1 [float] --duration2 [float] --steps [int]")

function arrayRemove(arr, value) {

  return arr.filter(function (ele, index) {
    return index != value;
  });
}

function splice(maintext, offset, text, removeCount = 0) {
  let calculatedOffset = offset < 0 ? maintext.length + offset : offset;
  return String(maintext).substring(0, calculatedOffset) +
    text + String(maintext).substring(calculatedOffset + removeCount);
}

Number.prototype.round = function (places = 0) {
  var xnr = "0.5"
  for (var i = 0; i <= places; i++)
    var xnr = parseFloat(splice(xnr, 2, "0"))
  return parseFloat(String(this + xnr).substring(0, places + 3))
}

function concatenateArrays(arr1, arr2) {
  obj = {}
  arr1.forEach((element, index) => {
    obj[element] = arr2[index]
  });
  return obj
}

var aef = 0

function GenCamLobeSide(duration = parseFloat(), gamma = parseFloat(), lift = parseFloat(), steps = parseInt(), flip = false) {
  if (flip) liftarr.push(parseFloat(lift * 1000).round(2))
  if (flip) anglearr.push(0.0)
  const angle = duration / 4
  const s = Math.pow(2.0 * 0.00127 / lift, 1 / gamma) - 1
  const k = Math.acos(s) / angle
  const extents = 3.141259 / k

  step = extents / (steps - 5.0)
  if (aef <= step) aef = step
  for (var i = 0; i < steps; i++) {
    if (i != 0) {
      const x = i * step
      const dlift = (x >= extents)
        ? 0.0
        : lift * Math.pow(0.5 + 0.5 * Math.cos(k * x), gamma)
      liftarr.push(parseFloat(dlift * 1000).round(2))
      anglearr.push(x)
    }
  }
  if (flip) {
    anglearr.forEach((item, index) => {
      if (index > anglearr.length / 2)
        anglearr[index] = -item
    })
  } else {
    liftarr.reverse()
    anglearr.reverse()
  }
}

GenCamLobeSide(duration1, gamma1, lift, steps, false)
GenCamLobeSide(duration2, gamma2, lift, steps, true)

console.log(`public node custom_lobe {
  alias output __out: lobe;

  function lobe(filter_radius: ${aef} * units.deg)
  `)
anglearr.forEach((item, index) => {
  var lift = liftarr[index]
  console.log(`  lobe.add_sample(${item} * units.deg, ${lift} * units.mm)`)
})
console.log("}")