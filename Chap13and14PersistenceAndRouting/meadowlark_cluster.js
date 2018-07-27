var cluster = require('cluster');

function startWorker() {
    var worker = cluster.fork();
    console.log('Cluster: worker %d started', worker.id);
}

if (cluster.isMaster) {
    require('os').cpus().forEach(function() {
        startWorker();
    });

    // log any workers that disconnect; if a worker disconnects, it should exit
    //so wait for the exit event to spawn a new worker to replace
    cluster.on('disconnect', function(worker) {
        console.log('CLUSTER: Worker %d disconnected from the cluster.', worker.id);
    });

    //when a worker dies (exits) create a worker to replace it
    cluster.on('exit', function(worker, code, signal) {
        console.log('CLUSTER: Worker %d died with exit code %d (%s)', worker.id, code, signal);
        startWorker();
    });
} else {
    //start our app on worker
    require('./meadowlark.js')();
}