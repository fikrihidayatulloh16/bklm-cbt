# Production Documentation

## Warning message
- saat eksekusi perintah "docker logs bklm_redis" pastikan tidak muncul WARNING Memory overcommit jika muncul jalankan
    <> echo "vm.overcommit_memory = 1" | sudo tee -a /etc/sysctl.conf
    <> sudo sysctl -p