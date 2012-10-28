var module = process.argv[2]

function run (module, callback) {
  console.log('Module:', module)
  require('./' + module).run(callback)
}

global.run = run

if (module) {
  run(module)
}
else
{
  run('css')
  run('scripts')
  run('posts', function () {
    run('views')
  })
}