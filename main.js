var $ = require('jquery');
global.document = window.document;
global.navigator = window.navigator;
require('jquery-ui');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;


//display disk list 
//setInterval(listDisk, 3000);
listDisk();
//refresh button
$('#refresh').click(function() {listDisk();});
$('#write').click(function() {
  unmountFs($('#fs-list').val());
  writeImg($('#img-file').val(), $('#fs-list').val());
});

//create the progress bar
var progressbar = $( "#progressbar" ),
      progressLabel = $( ".progress-label" );
 
    progressbar.progressbar({
      value: false,
      change: function() {
        progressLabel.text( progressbar.progressbar( "value" ) + "%" );
      },
      complete: function() {
        progressLabel.text( "Complete!" );
      }
    });

progressbar.progressbar( "value", 0 );

//unmount partitions
function unmountFs(diskname) {
  var isPartition = new RegExp(diskname);
  exec('df -h', function(err, stdout, stderr) {
    var fsList = stdout.trim().split('\n');
    //add the filesystem list
    fsList.forEach(function(f) {
      f = f.trim().split(/[ ]+/);
      f.name = f[0];
      f.size = f[1];
      if(f.name != 'Filesystem' && isPartition.test(f.name)){
        console.log(f.name);
        //execute umount
        exec('umount ' + f.name, function(err, stdout, stderr) {
          if(err) {
            alert("Error: Unable to unmount " + f.name + " Please close all programs accessing this SD card and try again.");
          }
        });
      }
    });
  });
}

//list storage devices
function listDisk() {
  var fdisk = spawn('sudo', ['-S', '-p', '#sudo-password#', 'fdisk', '-l'], {stdio: 'pipe'});

  fdisk.stderr.on('data', function(data) {
    console.log('err:' + data);
    var lines = data.toString().trim().split('\n');
        lines.forEach(function (line) {
            if (line === '#sudo-password#') {
              //prompt for password
              var passwd = prompt("Please enter sudo password:");
              fdisk.stdin.write(passwd + '\n');
            }
        });

    
  });

  fdisk.stdout.on('data', function(data) {
    data = data.toString();
    console.log(data);
    var diskRe = /Disk (\/.*): (\d+)\.(\d+) GB/g;
    var matches = data.match(diskRe);
    if(matches) {
    $('#fs-list').html("");
    matches.forEach(function(match) {
      console.log(1);
      $('#fs-list').append('<option value="' + match.replace(diskRe,'$1') + '">' + match + '</option>');
    });
  }
  });
}

//sudo stderr function
function sudoErr(data) {
    console.log('err:' + data);
    var lines = data.toString().trim().split('\n');
        lines.forEach(function (line) {
            if (line === '#sudo-password#') {
              //prompt for password
              var passwd = prompt("Please enter sudo password:");
              fdisk.stdin.write(passwd + '\n');
            }
        });

    
  }

function getFileSize(imgfile, callback) {
  var cmdSize = exec('ls -nl '+ imgfile +' | awk \'{print $5}\'', function(err,stdout,stderr) {
    if(err){
      alert("error: unable to fetch img file size");
      console.log('something wrong');
    }
    else {
      callback(parseInt(stdout.trim()));
    }
  });
}

function writeImg(imgfile, diskname) {
  var dd = spawn('sudo', ['-S', '-p', '#sudo-password#', 'dd', 'if='+imgfile, 'of='+diskname], {stdio: 'pipe'});
  var tracker = spawn('sudo', ['-S', '-p', '#sudo-password#', 'watch', '-n5', 'pkill', '-USR1', '-n', '-x', 'dd']);

  tracker.stderr.on('data', sudoErr);

  getFileSize(imgfile, function(totalSize) { 
  console.log('size: '+ totalSize);

  dd.stderr.on('data', function(data) {
    var completeRe = /(\d+) bytes/;
    var lines = data.toString().trim().split('\n');
        lines.forEach(function (line) {
          var matches = line.match(completeRe);
              if(matches) {
                var complete = parseInt(matches[0].replace(completeRe, '$1'));
                console.log(totalSize);
                console.log((complete*100)/totalSize);
                progressbar.progressbar('value', (complete*100)/totalSize);
              }

              else if (line === '#sudo-password#') {
                //prompt for password
                var passwd = prompt("Please enter sudo password:");
                fdisk.stdin.write(passwd + '\n');
            }
        });

  });

  dd.on('close', function(code) {
    alert('Operation completed with code: ' + code);
    //TODO: kill tracker process
    //tracker.stdin.pause();
    //tracker.kill('SIGINT');
  });

  });


}
