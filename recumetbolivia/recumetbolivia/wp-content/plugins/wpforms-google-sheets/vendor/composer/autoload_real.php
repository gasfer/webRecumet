<?php

// autoload_real.php @generated by Composer

class ComposerAutoloaderInitd1d9b031a4c05a7d5e05db1805649683
{
    private static $loader;

    public static function loadClassLoader($class)
    {
        if ('Composer\Autoload\ClassLoader' === $class) {
            require __DIR__ . '/ClassLoader.php';
        }
    }

    /**
     * @return \Composer\Autoload\ClassLoader
     */
    public static function getLoader()
    {
        if (null !== self::$loader) {
            return self::$loader;
        }

        spl_autoload_register(array('ComposerAutoloaderInitd1d9b031a4c05a7d5e05db1805649683', 'loadClassLoader'), true, true);
        self::$loader = $loader = new \Composer\Autoload\ClassLoader(\dirname(__DIR__));
        spl_autoload_unregister(array('ComposerAutoloaderInitd1d9b031a4c05a7d5e05db1805649683', 'loadClassLoader'));

        require __DIR__ . '/autoload_static.php';
        call_user_func(\Composer\Autoload\ComposerStaticInitd1d9b031a4c05a7d5e05db1805649683::getInitializer($loader));

        $loader->register(true);

        return $loader;
    }
}
